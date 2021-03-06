import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ChatFeed, Message } from 'react-chat-ui';
import {
  List,
  ListItem,
  Card,
  TextField,
  Avatar,
  Subheader,
  Divider,
  IconButton,
} from 'material-ui';
import { Row, Col } from 'react-flexbox-grid';
import Immutable from 'immutable';

import io from 'socket.io-client';
import * as crypto from '../crypto';

class Chat extends Component {
  constructor() {
    super();

    this.state = {
      text: '',
      messages: [],
      joined: false,
      useCustomBubble: false,
      users: Immutable.Map(),
      userRequests: Immutable.Map(),
    };

    this.socket = io.connect();

    this.socket.on('connect', () => {
      console.log('socket.io connected');

      this.keys = {};
      crypto
        .generateSignatureKeyPair()
        .then((key) => {
          this.keys.signature = key;
        })
        .then(() => crypto.generateAsymmetricEncryptionKeyPair())
        .then((key) => {
          this.keys.encryption = key;
          return this.keys;
        })
        .then(keys =>
          Promise.all([
            window.crypto.subtle.exportKey('jwk', keys.encryption.publicKey),
            window.crypto.subtle.exportKey('jwk', keys.signature.publicKey),
            window.crypto.subtle.exportKey('pkcs8', keys.encryption.privateKey),
            window.crypto.subtle.exportKey('pkcs8', keys.signature.privateKey),
          ]))
        .then((keys) => {
          this.socket.emit('request_identity', {
            encryption: keys[0],
            signature: keys[1],
            decryption: keys[2],
            signing: keys[3],
          });
        });
    });

    // TODO: emit identity with public key (both signing and encryption keys?)
    // (w/out signature? extra state object?)

    // TODO: Don't allow any message submissions until identity is stablished
    this.socket.on('identity', (signed_identity) => {
      console.log('Identity received:');
      console.log(signed_identity);

      // TODO: verify identity

      // TODO: put into if-statement (when server identity is verified)
      this.setState({ currUser: signed_identity });

      this.socket.emit('room_request', {
        body: {
          room: this.props.match.params.chatname,
          active: true,
          user: this.state.currUser,
        },
        signature: 'SIGNED WITH USER SIGNING KEY',
      });
    });

    this.socket.on('request_reply', (isAccepted) => {
      if (isAccepted) {
        this.socket.emit('hello', {
          room: this.props.match.params.chatname,
          identity: this.state.currUser,
        });
        this.setState({
          joined: true,
        });
      } else {
        console.log('Request denied');
        alert('Your request to join this room was not approved.');
        this.props.history.push('/');
      }
    });

    this.socket.on('room_request', (request) => {
      if (request.body.active) {
        this.setState({
          userRequests: this.state.userRequests.set(
            request.body.user.socketId,
            request.body.user,
          ),
        });
      } else {
        this.setState({
          userRequests: this.state.userRequests.delete(request.body.user.socketId),
        });
      }
    });

    this.socket.on('hello', (user) => {
      console.log(`User joined room: ${user.identity.socketId}`);
      console.log(user);

      this.setState({
        users: this.state.users.set(user.identity.socketId, user.identity),
      });

      this.socket.emit('welcome', {
        room: this.props.match.params.chatname,
        to_socket: user.identity.socketId,
        identity: this.state.currUser,
      });
    });

    this.socket.on('welcome', (msg) => {
      console.log(`Received welcome from: ${msg.identity.socketId}`);
      this.setState({
        users: this.state.users.set(msg.identity.socketId, msg.identity),
      });
      if (this.state.users.size === msg.room_size - 1) {
        console.log('Received welcome from all participants');
      }
    });

    this.socket.on('message', (msg) => {
      console.log('New message received:');
      console.log(msg);

      if (msg.sender === this.state.currUser.socketId) return;
      console.log('message sender');
      console.log(msg.sender);
      console.log(this.state.users);
      crypto
        .processMessage(
          this.state.currUser,
          this.keys.encryption.privateKey,
          msg,
        )
        .then((text) => {
          this.pushMessage(msg.sender, text);
          console.log(`currUser: ${this.state.currUser.socketId}`);
          console.log(`sender: ${msg.sender}`);
        });
    });

    this.socket.on('bye', (socket) => {
      this.setState({
        userRequests: this.state.userRequests.delete(socket),
        users: this.state.users.delete(socket),
      });
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
    this.pushMessage(this.state.currUser.socketId, this.state.text);

    crypto
      .generateMessage(this.state.currUser, this.state.users, this.state.text)
      // .then((message) => {
      //   return crypto.signMessageBody(this.state.currUser, message);
      // })
      .then((message) => {
        this.socket.emit('message', {
          room: this.props.match.params.chatname,
          body: message,
        });
        this.setState({ text: '' });
      });

    return true;
  }

  pushMessage(sender, message) {
    const isOwnMessage = sender === this.state.currUser.socketId;
    const newMessage = new Message({
      id: isOwnMessage ? 0 : sender,
      message,
      senderName: isOwnMessage
        ? this.state.currUser.displayName
        : this.state.users.get(sender).displayName,
    });
    this.setState({ messages: [...this.state.messages, newMessage] });
  }

  replyToRoomRequest(user, response) {
    const reply = {
      body: {
        isAccepted: response,
        room: this.props.match.params.chatname,
        user,
      },
    };
    this.socket.emit('request_reply', reply);
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

    const activeUsers = this.state.users.valueSeq().map((user) => {
      return (
        <ListItem
          key={user.socketId}
          primaryText={user.displayName}
          leftAvatar={<Avatar src={user.photos[0].value} />}
        />
      );
    });

    const requestingUsers = this.state.userRequests.valueSeq().map((user) => {
      return (
        <ListItem
          key={user.socketId}
          primaryText={user.displayName}
          leftAvatar={<Avatar src={user.photos[0].value} />}
          rightIconButton={
            <div>
              <IconButton
                iconClassName="material-icons"
                tooltip="Accept"
                onClick={() => this.replyToRoomRequest(user, true)}
              >
                thumb_up
              </IconButton>
              <IconButton
                iconClassName="material-icons"
                tooltip="Decline"
                onClick={() => this.replyToRoomRequest(user, false)}
              >
                thumb_down
              </IconButton>
            </div>
          }
        />
      );
    });

    return (
      <Row middle="xs" style={{ height: window.innerHeight }}>
        <Col smOffset={1} xs={12} sm={3}>
          <Card className="container">
            <List>
              <Subheader>Active users</Subheader>
              {activeUsers}
            </List>
            <Divider />
            <List>
              <Subheader>Awaiting approval</Subheader>
              {requestingUsers}
            </List>
          </Card>
        </Col>
        <Col xs={12} sm={7}>
          <Card className="container">
            <div className="chatfeed-wrapper">
              <ChatFeed
                chatBubble={this.state.useCustomBubble && customBubble}
                maxHeight={500}
                messages={this.state.messages}
                showSenderName
              />

              <form onSubmit={e => this.onMessageSubmit(e)}>
                <TextField
                  disabled={!this.state.joined}
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
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      chatname: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Chat;
