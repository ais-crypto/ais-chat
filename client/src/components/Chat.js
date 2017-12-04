import React, { Component } from 'react';
import { ChatFeed, Message } from 'react-chat-ui';
import { Card, TextField } from 'material-ui';
import { Row, Col } from 'react-flexbox-grid';

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

    this.socket.on('user_info', msg => {
      console.log(msg);
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
      text: '',
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
    e.preventDefault();
    if (!this.state.text) return false;
    this.socket.emit('message', {
      room: this.props.match.params.chatname,
      body: {
        sender: '', // access cookie for userID or display name
        signature: '',
        text: this.state.text
      }
    });
    this.pushMessage(this.state.curr_user, this.state.text);
    this.setState({ text: '' });
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
    return (
      <Row middle="xs" style={{ height: window.innerHeight }}>
        <Col xs={8} xsOffset={2}>
          <Card className="container">
            <div className="chatfeed-wrapper">
              <ChatFeed
                chatBubble={this.state.useCustomBubble && customBubble}
                maxHeight={500}
                messages={this.state.messages} // Boolean: list of message objects
                showSenderName
              />

              <form onSubmit={e => this.onMessageSubmit(e)}>
                <TextField
                  value={this.state.text}
                  onChange={e => {
                    this.setState({ text: e.target.value });
                  }}
                  hintText="Type a message..."
                  fullWidth={true}
                />
              </form>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default Chat;
