'use babel';

import CloudCodeView from './cloud-code-view';
import { CompositeDisposable } from 'atom';
import { Config, QingStor } from 'qingstor-sdk';

export default {

  cloudCodeView: null,
  modalPanel: null,
  subscriptions: null,
  data:null,

  activate(state) {
    var QingStor = require('qingstor-sdk').QingStor;
    var Config = require('qingstor-sdk').Config;
    var config = new Config('NFVHZHRIDLBKKOLKXHKB', '7KzUEurzsuxfGWM1501VJdg7JuF69JgtwsUiUoUw');
    var bucket = new QingStor(config).Bucket('cloudcode1', 'sh1a');

    this.list_showed = false;

    bucket.listObjects( (err, data) => {
      this.data=data;
      this.cloudCodeView.files=this.toJSON(this.toKeyArray(this.data.keys));
      var list = this.cloudCodeView.generateListView(this.cloudCodeView.files);
      this.cloudCodeView.getElement().appendChild(list);
      list.classList.add('has-collapsable-children','top-list');

      this.cloudCodeView.getElement().appendChild(this.cloudCodeView.createButton('Download',['btn', 'icon', 'icon-cloud-download'],() => {
        var fs=require('fs');
        var filePath="C:/Users/qyy/github/cloud-code/codes/"+this.cloudCodeView.getSelectedItemPath()[1];
        console.log(this.cloudCodeView.files);
        console.log(this.data.keys);
        console.log(this.cloudCodeView.getSelectedItemPath());
        bucket.getObject(this.cloudCodeView.getSelectedItemPath()[0],
        {},
        function(err, data) {
          console.log(data.statusCode);
          console.log(data.body);
          fs.writeFile(filePath, data.body);
          atom.workspace.open(filePath);
        });
      }));

      this.cloudCodeView.getElement().appendChild(this.cloudCodeView.createButton('Sync',['btn', 'icon', 'icon-sync'],() => {
        var configArr=this.cloudCodeView.config;
        var configTemp = new Config(configArr[2].getAttribute('value'), configArr[3].getAttribute('value'));
        var bucketTemp = new QingStor(configTemp).Bucket(configArr[0].getAttribute('value'), configArr[1].getAttribute('value'));
        bucketTemp.listObjects((err, data)=>{
          this.data=data;
          this.cloudCodeView.files=this.toJSON(this.toKeyArray(this.data.keys));
          console.log(this.data.keys);
          var listTemp = this.cloudCodeView.generateListView(this.cloudCodeView.files);
          listTemp.classList.add('has-collapsable-children','top-list');
          this.cloudCodeView.getElement().replaceChild(listTemp, list);
          list=listTemp;
        })
      }));

      this.cloudCodeView.getElement().appendChild(this.cloudCodeView.createButton('Upload',['btn', 'icon', 'icon-cloud-upload'],() => {
        var fs=require('fs');
        var editor=atom.workspace.getActiveTextEditor();

        bucket.putObject(editor.getTitle(),
        {'body':
        fs.createReadStream(editor.getPath())},
        function(err, data) {
          console.log(data.statusCode);
        });
      }));

      this.cloudCodeView.getElement().appendChild(this.cloudCodeView.createButton('Delete',['btn', 'icon', 'icon-trashcan'],() => {
        var fs=require('fs');

        bucket.deleteObject(this.cloudCodeView.getSelectedItemPath()[0],
        (err, data)=> {
          console.log(data.statusCode);
          console.log(this.cloudCodeView.getSelectedItemPath());
        });
      }));

      this.cloudCodeView.getElement().appendChild(this.cloudCodeView.createButton('Config',['btn', 'icon', 'icon-gear'],() => {
        this.cloudCodeView.configPanel.style.display = (this.cloudCodeView.configPanel.style.display == 'none')?('block'):'none';
      }));


      this.cloudCodeView.config = Array(this.cloudCodeView.createInput('Bucket Name','cloudcode1'),
                        this.cloudCodeView.createInput('Zone', 'sh1a'),
                        this.cloudCodeView.createInput('Access Key ID', 'NFVHZHRIDLBKKOLKXHKB'),
                        this.cloudCodeView.createInput('Secret Access Key', '7KzUEurzsuxfGWM1501VJdg7JuF69JgtwsUiUoUw'));
      console.log(data.statusCode);
      this.cloudCodeView.configPanel = this.cloudCodeView.createConfigPane();
      this.cloudCodeView.configPanel.style.display = 'none';
      this.cloudCodeView.getElement().appendChild(this.cloudCodeView.configPanel);
    });

    console.log(this.data);
    this.cloudCodeView = new CloudCodeView(state.cloudCodeViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.cloudCodeView.getElement(),
      visible: false
    });
    this.modalPanel.className = 'cloud-code-panel';

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cloud-code:toggle': () => this.toggle()
    }));

  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.cloudCodeView.destroy();
  },

  serialize() {
    return {
      cloudCodeViewState: this.cloudCodeView.serialize()
    };
  },

  toJSON(dataList){
    var arr;
    var json={};
    var str="json";
    for(row in dataList){
      arr=dataList[row].split("/");
      for(col in arr){
        var colEle=json;
        for(var i=0; i<=col; i++){
          if(!colEle[arr[i]] && arr[i]!=""){
            colEle[arr[i]]={};
          }

          if(col!=(arr.length-1) || col!=i){
            colEle=colEle[arr[i]];
          }
        }

        if(col==(arr.length-1) && arr[i-1]!=""){
          colEle[arr[i-1]]=dataList[row];
        }

      }
    }

    return json;
  },

  toKeyArray(keysList){
    var arr=[];
    for(var num=0; num<keysList.length; num++){
      arr[num]=keysList[num]["key"];
    }
    return arr;
  },

  toggle() {


    console.log('CloudCode was toggled!');


    return (
      this.modalPanel.isVisible() ? this.modalPanel.hide() : this.modalPanel.show()
    );
  }



};
