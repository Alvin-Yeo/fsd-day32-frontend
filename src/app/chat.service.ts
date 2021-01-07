import { Injectable } from "@angular/core";
import { HttpParams } from '@angular/common/http';
import { Subject } from "rxjs";

export interface ChatMessage {
    from: string;
    message: string;
    timestamp: string;
}

@Injectable()
export class ChatService {
    
    private sock: WebSocket = null;

    event = new Subject<ChatMessage>();

    join(name: string) {
        const params = new HttpParams().set('name', name);
        this.sock = new WebSocket(`ws://localhost:3000/chat?${params.toString()}`);

        // listen to incoming message
        this.sock.onmessage = (payload: MessageEvent) => {
            const chat = JSON.parse(payload.data) as ChatMessage;
            this.event.next(chat);
        };
        
        // if the connection was closed unexpectedly
        this.sock.onclose = (() => {
            if(this.sock !== null) {
                console.log('[ERROR] Connection is closed unexpectedly.');
                this.sock.close();
                this.sock = null;
            }
        }).bind(this);
    }

    leave() {
        if(this.sock !== null) {
            this.sock.close();
            this.sock = null;
        }
    }

    send(msg: string) {
        this.sock.send(msg);
    }
}