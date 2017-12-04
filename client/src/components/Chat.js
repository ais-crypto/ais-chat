import React, { Component } from 'react';
import { ChatFeed, Message } from 'react-chat-ui';
import io from 'socket.io-client';

const users = {
  0: 'You',
  1: 'Mark',
  2: 'Evan'
};

const customBubble = props => (
  <div>
    <p>{`${props.message.senderName} ${props.message.id ? 'says' : 'said'}: ${
      props.message.message
    }`}</p>
  </div>
);

class Chat extends Component {
  constructor() {
    super();

    this.socket = io.connect();
    this.socket.on('connect', () => {
      console.log('socket.io connected');
      this.socket.emit('room', this.props.match.params.chatname);
    });

    this.socket.on('message', msg => {
      console.log('new message received');
      console.log(msg);
      this.pushMessage(2, msg.text); // Change to correct user id
    });

    this.socket.on('disconnect', () => {
      console.log('socket.io disconnected');
    });
    this.socket.on('reconnect', () => {
      console.log('socket.io reconnected');
    });
    this.socket.on('error', error => {
      console.log(error);
    });

    this.state = {
      messages: [
        new Message({ id: 1, message: 'Hey guys!', senderName: 'Mark' }),
        new Message({ id: 1, message: 'Hey guys!', senderName: 'Mark' }),
        new Message({ id: 1, message: 'Hey guys!', senderName: 'Mark' }),
        new Message({
          id: 2,
          message: 'Hey! Evan here. react-chat-ui is pretty dooope.',
          senderName: 'Evan'
        }),
        new Message({ id: 0, message: 'Chocolate!', senderName: 'Simon' }),
        new Message({ id: 0, message: 'Ice cream!', senderName: 'Simon' })
      ],
      useCustomBubble: false,
      curr_user: 0
    };
  }

  onMessageSubmit(e) {
    const message = this.input.value;
    e.preventDefault();
    if (!message) return false;
    console.log(message);
    this.socket.emit('message', {
      room: this.props.match.params.chatname,
      body: {
        sender: '', // access cookie for userID or display name
        signature: '',
        text: message
      }
    });
    this.pushMessage(this.state.curr_user, message);
    this.input.value = '';
    return true;
  }

  pushMessage(sender, message) {
    const newMessage = new Message({
      id: sender,
      message,
      senderName: users[sender]
    });
    this.setState({ messages: [...this.state.messages, newMessage] });
  }

  render() {
    console.log(this.props);
    return (
      <div className="container">
        <div className="chatfeed-wrapper">
          <ChatFeed
            chatBubble={this.state.useCustomBubble && customBubble}
            maxHeight={500}
            messages={this.state.messages} // Boolean: list of message objects
            showSenderName
          />

          <form onSubmit={e => this.onMessageSubmit(e)}>
            <input
              ref={i => {
                this.input = i;
              }}
              placeholder="Type a message..."
              className="message-input"
            />
          </form>
        </div>
      </div>
    );
  }
}

export default Chat;
