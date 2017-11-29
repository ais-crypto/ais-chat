import React, { Component } from 'react';
import { Launcher } from 'react-chat-window';
import io from 'socket.io-client';

class Chat extends Component {
  constructor() {
    super();

    this.socket = io.connect('http://localhost:3002/');
    this.socket.on('connect', () => { console.log('socket.io connected'); });
    this.socket.on('disconnect', () => { console.log('socket.io disconnected'); });
    this.socket.on('reconnect', () => { console.log('socket.io reconnected'); });
    this.socket.on('error', (error) => { console.log(error); });

    this.state = {
      messageList: [],
    };

  }

  render() {
    console.log(this.props);
    return <div />;
  }
}

export default Chat;
