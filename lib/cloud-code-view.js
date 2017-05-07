'use babel';

import CloudCode from './cloud-code.js';

export default class CloudCodeView {
  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('cloud-code');
    this.files = {
      "Codes":{
        "includes":{"iostream.h":'Codes/includes/iostream.h'},
        "stdafx.h":'Codes/stdafx.h'
      },
      "README.md":'README.md'
    };

    const message = document.createElement('h1');
    message.classList.add('title');
    message.appendChild(document.createTextNode('Cloud Code'));
    this.element.appendChild(message);


    const closeBtn = this.createButton('Close',['btn','btn-error','icon','icon-x'], ()=>{
      var panels = atom.workspace.getModalPanels();
      for(var p of panels){
        if(p.className == 'cloud-code-panel'){
          p.hide();
        }
      }
    });
    closeBtn.classList.add('close-btn');
    this.element.appendChild(closeBtn);

    this.items = Array();

  }

  getSelectedItemPath(){
    var path = '';
    var selected = document.getElementsByClassName('chosen');
    if(selected[0]){
      let cur = selected[0];
      console.log(this.findKey(cur.innerText));
      return [this.findKey(cur.innerText), cur.innerText];
    }
    return ["Not find", cur.innerText];
  }

  findKey(keyToFind){
    var key;
    var parent=this.files;
    var value=this.files;
    for(key in this.files){
      value=this.files[key];
    while(typeof value=="object"){
      parent=value;
      for(key in parent){
        value=parent[key];
        if(typeof value=="object"){
          break;
        }
        if(key==keyToFind){
          return value;
        }
      }
    }

  }
    return "can't find";
  }

  createConfigPane(){
    const div = document.createElement('div');
    const panel = document.createElement('atom-panel');
    panel.classList.add('config-block','padded');

    const inner = document.createElement('div');
    inner.classList.add('inset-panel');

    const header = document.createElement('div');
    header.classList.add('panel-heading');
    header.appendChild(document.createTextNode('Config'));

    const body = document.createElement('div');
    body.classList.add("panel-body","padded");

    for(var input of this.config){
      body.appendChild(input);
    }

    inner.appendChild(header);
    inner.appendChild(body);
    panel.appendChild(inner);
    div.appendChild(panel);
    return div;
  }

  createInput(placeholder, defaultVal){
    const input = document.createElement('input');
    input.classList.add('input-text');
    input.setAttribute('type','text');
    input.setAttribute('value', defaultVal);
    input.setAttribute('placeholder',placeholder);
    return input;
  }


  generateListView(fileTree){
    var list = document.createElement('ul');
    list.classList.add('list-tree');
    for(var item in fileTree){
      if(typeof fileTree[item] == 'string'){
        list.appendChild(this.createFileItem(item));
      }else if(typeof fileTree[item] == 'object'){
        var next = this.createDictItem(item);
        next.appendChild(this.generateListView(fileTree[item]));
        list.appendChild(next);
      }
    }
    return list;
  }



  createFileItem(name){
    var li = document.createElement('li');
    this.items.push(li);
    this.addClickListener(li);
    li.classList.add('list-item');
    var span = document.createElement('span');
    span.classList.add('icon','icon-file-text');
    span.appendChild(document.createTextNode(name));
    li.appendChild(span);
    return li;
  }

  createDictItem(name){
    var li = document.createElement('li');
    this.items.push(li);
    this.addClickListener(li);
    li.classList.add('list-nested-item','collapsed','directory');
    var div = document.createElement('div');
    div.classList.add('list-item');
    var span = document.createElement('span');
    span.classList.add('icon','icon-file-directory');
    span.appendChild(document.createTextNode(name));
    div.appendChild(span);
    li.appendChild(div);
    return li;
  }

  addClickListener(item){
    item.addEventListener('click',(e)=>{
      e.stopPropagation();
      for(var i of this.items){
        if(i.classList.contains('selected')){
          i.classList.remove('selected');
          i.classList.remove('chosen');
        }
      }
      item.classList.add('selected');
      item.classList.add('chosen');
      if(item.classList.contains('directory')){
        if(item.classList.contains('collapsed')){
          item.classList.remove('collapsed');
        }else {
          item.classList.add('collapsed');
        }
      }
    });
  }

  createButton(title,classNames,clickHandler){
    const button = document.createElement('button');
    for(var cname of classNames){
      button.classList.add(cname);
    }
    button.setAttribute("id", title);
    button.appendChild(document.createTextNode(title));
    button.addEventListener('click',clickHandler);
    return button;
  }



  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
