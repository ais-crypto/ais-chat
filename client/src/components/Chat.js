import React, { Component } from 'react';
import { Launcher } from 'react-chat-window';
import io from 'socket.io-client';

class Chat extends Component {
  constructor() {
    super();

    this.socket = io.connect('/');
    this.socket.on('connect', () => { console.log('socket.io connected'); });
    this.socket.on('disconnect', () => { console.log('socket.io disconnected'); });
    this.socket.on('reconnect', () => { console.log('socket.io reconnected'); });
    this.socket.on('error', (error) => { console.log(error); });

    this.state = {
      messageList: [],
    };
  }

  onMessageWasSent(message) {
    this.setState({
      messageList: [...this.state.messageList, message],
    });
  }

  sendMessage(text) {
    if (text.length > 0) {
      this.setState({
        messageList: [...this.state.messageList, {
          author: 'them',
          type: 'text',
          data: { text }
        }]
      })
    }
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
