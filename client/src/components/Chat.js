import React, { Component } from 'react';
import { Launcher } from 'react-chat-window';
import io from 'socket.io-client';

class Chat extends Component {
  constructor() {
    super();

    this.socket = io.connect();
    this.socket.on('connect', () => {
      console.log('socket.io connected');
      this.socket.emit('room', this.props.match.params.chatname);
    });

    this.socket.on('message', (msg) => {
      console.log('new message received');
      console.log(msg);
      this.setState({
        messageList: [...this.state.messageList, {
          author: 'them', // change to msg.sender after changing package rendering
          type: 'text',
          data: {
            text: msg.text,
          },
        }]
      });
    });

    this.socket.on('disconnect', () => { console.log('socket.io disconnected'); });
    this.socket.on('reconnect', () => { console.log('socket.io reconnected'); });
    this.socket.on('error', (error) => { console.log(error); });

    this.state = {
      messageList: [],
    };
  }

  onMessageWasSent(message) {
    console.log(message);
    this.socket.emit('message', {
      room: this.props.match.params.chatname,
      body: {
        sender: '',  // access cookie for userID or display name
        signature: '',
        text: message.data.text,
      },
    });
  }

  render() {
    console.log(this.props);
    return (
      <div>
        <Launcher
          agentProfile={{
            teamName: this.props.match.params.chatname
          }}
          onMessageWasSent={this.onMessageWasSent.bind(this)}
          messageList={this.state.messageList}
        />
      </div>
    );
  }
}

export default Chat;
