import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ChatFeed, Message } from 'react-chat-ui';
import { Card, TextField } from 'material-ui';
import { Row, Col } from 'react-flexbox-grid';
import Immutable from 'immutable';

import io from 'socket.io-client';

class Chat extends Component {
  constructor() {
    super();

    this.state = {
      text: '',
      messages: [],
      useCustomBubble: false,
      users: Immutable.Map(),
    };

    this.socket = io.connect();

    this.socket.on('connect', () => {
      console.log('socket.io connected');

      // TODO: insert signature pair object
      this.socket.emit(
        'request_identity',
        'USER PUBLIC SIGNATURE KEY AS OBJECT HERE',
      );

      // TODO: emit identity with public key (both signing and encryption keys?)
      // (w/out signature? extra state object?)
    });

    this.socket.on('identity', (signed_identity) => {
      console.log('Identity received:');
      console.log(signed_identity);

      // TODO: verify identity

      // TODO: put into if-statement (when server identity is verified)
      this.setState({ curr_user: signed_identity });

      this.socket.emit('room_request', {
        room: this.props.match.params.chatname,
        body: {
          identity: this.state.curr_user,
          signature: 'SIGNED WITH USER SIGNING KEY',
        },
      });

      this.socket.on('request_accepted', () => {
        this.socket.emit('hello', {
          room: this.props.match.params.chatname,
          identity: this.state.curr_user,
        });
      });
    });

    this.socket.on('room_request', (signed_id) => {
      // TODO: verify id with signature
      // TODO: add this user to the sidebar ui
    });

    this.socket.on('hello', (user) => {
      console.log(`User joined room: ${user.identity.id}`);

      this.setState({
        users: this.state.users.set(user.identity.id, user.identity),
      });

      this.socket.emit('welcome', {
        room: this.props.match.params.chatname,
        to_socket: user.socket,
        identity: this.state.curr_user,
      });
    });

    this.socket.on('welcome', (msg) => {
      console.log(`Received welcome from: ${msg.identity.id}`);
      this.setState({
        users: this.state.users.set(msg.identity.id, msg.identity),
      });
      if (this.state.users.size === msg.room_size - 1) {
        console.log('Received welcome from all participants');
      }
    });

    this.socket.on('message', (msg) => {
      console.log('New message received:');
      console.log(msg);

      // TODO: decrypt message

      // TODO: verify signature of message (only push IF verified)
      this.pushMessage(msg.sender, msg.text);

      console.log(`curr_user: ${this.state.curr_user.id}`);
      console.log(`sender: ${msg.sender}`);
    });

    this.socket.on('disconnect', () => {
      console.log('socket.io disconnected');
    });

    this.socket.on('reconnect', () => {
      console.log('socket.io reconnected');
    });

    this.socket.on('error', (error) => {
      console.error(error);
    });
  }

  onMessageSubmit(e) {
    e.preventDefault();
    if (!this.state.text) return false;

    // TODO: generate new group key & make group_keys object for message

    // TODO: sign message & add to signature

    this.socket.emit('message', {
      room: this.props.match.params.chatname,
      group_keys: { id: 'GROUP KEY ENCRYPTED BY EACH PUBLIC KEY' },
      body: {
        sender: this.state.curr_user.id,
        signature: 'SIGNATURE HERE',
        text: this.state.text,
      },
    });
    this.setState({ text: '' });
    return true;
  }

  pushMessage(sender, message) {
    const isOwnMessage = sender === this.state.curr_user.id;
    const newMessage = new Message({
      id: isOwnMessage ? 0 : sender,
      message,
      senderName: isOwnMessage
        ? this.state.curr_user.displayName
        : this.state.users.get(sender).displayName,
    });
    this.setState({ messages: [...this.state.messages, newMessage] });
  }

  render() {
    const customBubble = props => (
      <div>
        <p>
          {`${props.message.senderName} ${
            props.message.id ? 'says' : 'said'
          }: ${props.message.message}`}
        </p>
      </div>
    );

    const memberRequest = props => <div />;

    // TODO: fix this card column ui & possibly separate out into separate Component

    return (
      <Row middle="xs" style={{ height: window.innerHeight }}>
        <Col xs={2}>
          <Card className="container">
            {this.state.users.map(u => <div>{u.displayName}</div>)}
          </Card>
        </Col>
        <Col xs={8}>
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
                  onChange={(e) => {
                    this.setState({ text: e.target.value });
                  }}
                  hintText="Type a message..."
                  fullWidth
                />
              </form>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }
}

Chat.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      chatname: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Chat;
