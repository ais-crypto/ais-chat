import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import { Row, Col } from 'react-flexbox-grid';

class Home extends Component {
  render() {
    return (
      <Row middle="xs" center="xs" style={{ height: window.innerHeight }}>
        <Col>
          <form
            onSubmit={(e) => {
              this.props.history.push(this.state.room);
              e.preventDefault();
            }}
          >
            <TextField
              className="room-input"
              hintText="Type a room name"
              floatingLabelText="Create or join a room"
              onChange={(e) => {
                this.setState({ room: e.target.value });
              }}
            />
          </form>
        </Col>
      </Row>
    );
  }
}

Home.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default Home;
