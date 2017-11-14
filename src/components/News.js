import React from 'react';
import axios from 'axios';

class News extends React.Component {
  constructor(props) {
    super(props)
    this.left = this.left.bind(this)
    this.right = this.right.bind(this)
  }

  left() {
    let pointer = this.state.newsPointer
    if (this.state.newsPointer === 0) {
      pointer = this.state.news.length-1;
    } else {
      pointer = pointer-1;
    }
    this.setState({
      newsPointer: pointer
    })
  }

  right() {
    let pointer = this.state.newsPointer;
    if(this.state.newsPointer === this.state.news.length-1) {
      pointer = 0;
    } else {
      pointer++
    }
    this.setState({
      newsPointer: pointer
    })
  }

  componentWillMount() {
    axios.get('/news').then(results => {
      let index = Math.floor(Math.random()*results.data.length)
      this.setState({
        newsPointer: index,
        news: results.data,
      })
    }).catch(err => console.log(err))
  }

  render() {
    const left = '<'
    const right = '>'
    const self = this;
    return (
      <div className="center">
        <h3 className="center">Recent Football News</h3>
        {this.state &&
          <div className="newsHolder">
            <a  onClick={() => window.open(self.state.news[self.state.newsPointer].url)}>{this.state.news[this.state.newsPointer].title}</a>
            <h5>Author: {this.state.news[this.state.newsPointer].author || 'Various'}</h5>
            <img alt='' onClick={() => window.open(self.state.news[self.state.newsPointer].url)} className="newsImage" src={this.state.news[this.state.newsPointer].urlToImage}></img>
            <div id="navButtons">
              <button onClick={this.left}>{left}</button>
              <button onClick={this.right}>{right}</button>
            </div>
            <div className="center" id="pagination">{this.state.newsPointer+1} / {this.state.news.length}</div>
          </div>
        }
        <h6>News provided by newsapi.org</h6>
      </div>
    )
  }
}

export default News;
