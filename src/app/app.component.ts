import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage, ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  userForm: FormGroup;
  chatForm: FormGroup;

  event$: Subscription;
  messages: ChatMessage[] = [];

  constructor(
    private fb: FormBuilder,
    private chatSvc: ChatService
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      username: this.fb.control('', [ Validators.required ])
    });

    this.chatForm = this.fb.group({
      message: this.fb.control('', [ Validators.required ])
    });
  }

  onJoinBtn(btnElem) {
    const username = this.userForm.get('username').value;

    if(btnElem.innerText === 'Join') {
      this.chatSvc.join(username);
      btnElem.innerText = 'Leave';
      console.log('Connection established for', username);

      // subsribe to incoming message
      this.event$ = this.chatSvc.event.subscribe((chat) => {
        this.messages.unshift(chat);
      });
    } else {
      this.chatSvc.leave();
      btnElem.innerText = 'Join';
      console.log('Connection closed for', username);
      this.userForm.get('username').reset();

      // unsubscribe to the event
      this.event$.unsubscribe();
      this.event$ = null;
    }
    
  }

  onChatBtn() {
    const message = this.chatForm.get('message').value;
    console.log('Message: ', message);
    this.chatSvc.send(message);
    this.chatForm.get('message').reset();
  }

  ngOnDestroy() {
    if(this.event$ !== null) {
      this.event$.unsubscribe();
      this.event$ = null;
    }
  }

}
