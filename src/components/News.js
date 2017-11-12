import React from 'react';
import axios from 'axios';
import Slider from 'react-slick'

class News extends React.Component {
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
    var settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1
    };
    console.log(Slider)
    return (
      <div className="center">
        <h3 className="center">Recent Football News</h3>
        {this.state &&
          <div className="newsHolder">
            <h2>{this.state.news[this.state.newsPointer].title}</h2>
            <h5>Author: {this.state.news[this.state.newsPointer].author || 'Various'}</h5>
            <h5>Published At: {this.state.news[this.state.newsPointer].publishedAt}</h5>
            <img alt='' className="newsImage" src={this.state.news[this.state.newsPointer].urlToImage}></img>
            <br></br>
            <button onClick={() => {window.location.href="http://www.nfl.com/news/story/0ap3000000875015/article/jameis-winston-fined-12k-for-poking-lattimore"}}>Link to article</button>
          </div>
        }
        {/* <Slider {...settings}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </Slider> */}
        <h6>News provided by newsapi.org</h6>
      </div>
    )
  }
}

export default News;