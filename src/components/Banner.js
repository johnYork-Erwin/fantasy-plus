import React from 'react';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.min.css'
import {ToastContainer, toast} from 'react-toastify'
import {Link} from 'react-router-dom'
// import axios from 'axios'

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width: '500px',
    height: '200px',
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

  validate(command, e) {
    if (e) e.preventDefault();
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
      this.setState({
        username: '',
        password: '',
      })
      this.closeModal();
    } else {
      toast.error('The form is incomplete...');
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
        <div className="flexbox">
          <Link to={"/"}><img src=".testg" alt="" style={{height: '60px', width: '60px', marginLeft: '20px'}}></img></Link>
          <h1><Link to={'/'} style={{textDecoration: 'none', color: 'black'}}>Fantasy Plus</Link></h1>
          {this.props.loggedIn ?
            <h3>Welcome {this.props.userInfo.username}</h3> :
            <h3> </h3>
            }
          <button id='logIn' className="mainButton" onClick={()=> {
            if (this.props.loggedIn) this.props.logOut();
            else this.openModal();
          }}>{this.props.loggedIn ? 'Log Out': 'Log In'}</button>
        </div>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover>
        </ToastContainer>
        <Modal
          id="login"
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Modal">
          <h2 className="title" ref={subtitle => this.subtitle = subtitle}>Log In or Sign Up</h2>
          <form id="logInForm" name="form" onSubmit={() => this.validate('logIn')}>
            <div className="userName">
              <label>
                Username:
              </label>
              <input type="text" name="username" value={this.state.username} placeholder="username" onChange={this.handleChange}/>
            </div>
            <div className="passWord">
              <label>
                Password:
              </label>
              <input type="password" name="password" value={this.state.password} placeholder="password" onChange={this.handleChange}/>
            </div>
            <div className="modalButtons">
              <button type='button' onClick={this.closeModal}>Cancel</button>
              <button type='submit' onClick={(e) => this.validate('logIn', e)} label="Log In">Log In</button>
              <button type='button' onClick={(e) => this.validate('signUp', e)}>Sign Up</button>
            </div>
          </form>
        </Modal>
      </header>
    )
  }
}

export default Banner;
