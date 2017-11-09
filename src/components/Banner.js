import React from 'react';
import Modal from 'react-modal';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class Banner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      username: '',
      password: '',
      thisUser: this.props.userInfo.username,
    }
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validate = this.validate.bind(this);
  }

  validate(command) {
    if (this.state.username !== '' && this.state.password !== '') {
      let object = {
        username: this.state.username,
        password: this.state.password,
      }
      if (command === 'logIn') {
        this.props.logIn(object)
      } else if (command === 'signUp') {
        this.props.signUp(object)
      }
      console.log('setting state');
      this.setState({
        username: '',
        password: '',
      })
      this.closeModal();
    } else {
      console.log('not logging in because form is incomplete');
    }
  }

  handleChange(e) {
    const object = {}
    const title = e.target.name;
    object[title] = e.target.value;
    this.setState(object);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }


  render() {
    return (
      <header className='banner'>
        <h1> Welcome {this.props.loggedIn ? this.props.userInfo.username: ''} to Fantasy Plus! </h1>
        <button id='logIn' onClick={()=> {
            if (this.props.loggedIn) this.props.logOut();
            else this.openModal();
          }}>{this.props.loggedIn ? 'Log Out': 'Log In'}</button>
        <button onClick={this.props.update} className='updateDB'>Update DB</button>
        <Modal
          id="login"
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Modal">
          <h2 ref={subtitle => this.subtitle = subtitle}>Log In</h2>
          <form id="logInForm" name="form">
            <label>
              Username:
            </label>
            <input type="text" name="username" value={this.state.username} placeholder="username" onChange={this.handleChange}/>
            <label>
              Password:
            </label>
            <input type="text" name="password" value={this.state.password} placeholder="password" onChange={this.handleChange}/>
            <button onClick={this.closeModal}>Cancel</button>
            <button onClick={() => this.validate('logIn')} label="Log In">Log In</button>
            <button onClick={() => this.validate('signUp')}>Sign Up</button>
          </form>
        </Modal>
      </header>
    )
  }
}

export default Banner;
