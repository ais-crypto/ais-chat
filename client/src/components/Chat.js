import React, { Component } from 'react';
import { ChatFeed, Message } from 'react-chat-ui';
import { Card, TextField } from 'material-ui';
import { Row, Col } from 'react-flexbox-grid';
import Immutable from 'immutable';

import io from 'socket.io-client';


// TODO: migrate into component?
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

    this.state = {
      text: '',
      messages: [],
      useCustomBubble: false,
      users: Immutable.Map()
    };

    this.socket = io.connect();
    this.socket.on('connect', () => {
      console.log('socket.io connected');

      // TODO: insert signature pair object
      this.socket.emit(
        'request_identity', 'USER PUBLIC SIGNATURE KEY AS OBJECT HERE'
      );

      this.socket.on('identity', signed_identity => {
        console.log('Identity received:');
        console.log(signed_identity);

        // TODO: verify identity

        // TODO: put into if-statement (when server identity is verified)
        this.setState({
          curr_user_identity: signed_identity,
          curr_user: signed_identity.id,
          users: this.state.users.set(signed_identity.id, signed_identity)
        });

      });

      this.socket.emit('room', this.props.match.params.chatname);

      // TODO: emit identity with public key (w/out signature? extra state object?)
      this.socket.emit('new_hello', this.state.curr_user_identity);
      this.socket.on('hello', identity => {
        this.setState({
          users: this.state.users.set(identity.id, identity)
        });
      });

      // TODO: generate new group key (in chat-crypto) & communicate to everyone in pairs

      // TODO: prevent generating multiple group keys
      // stop key generation if received new member hello message?
    });

    this.socket.on('new_hello', identity => {
      this.socket.emit('hello', this.state.curr_user_identity);

      this.setState({
        users: this.state.users.set(identity.id, identity)
      });
    });

    this.socket.on('message', msg => {
      console.log('New message received:');
      console.log(msg);

      // TODO: decrypt message

      // TODO: verify signature of message (only push if verified)

      this.pushMessage(msg.sender, msg.text); // TODO: Change to correct user id

      console.log(`curr_user: ${this.state.curr_user}`);
      console.log(`sender: ${msg.sender}`);

    });

    this.socket.on('disconnect', () => {
      console.log('socket.io disconnected');
    });
    this.socket.on('reconnect', () => {
      console.log('socket.io reconnected');
    });
    this.socket.on('error', error => {
      console.error(error);
    });

  }

  onMessageSubmit(e) {
    e.preventDefault();
    if (!this.state.text) return false;
    this.socket.emit('message', {
      room: this.props.match.params.chatname,
      body: {
        sender: this.state.curr_user,
        signature: 'SIGNATURE HERE',
        text: this.state.text
      }
    });
    this.setState({ text: '' });
    return true;
  }

  pushMessage(sender, message) {
    const newMessage = new Message({
      id: sender,
      message,
      senderName: this.state.users.get(sender).displayName
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
