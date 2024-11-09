// utils/list_helper.js

const dummy = (blogs) => {
    return 1; // Always returns 1
  };

const totalLikes = (blogs) =>{
    return blogs.reduce((sum, blog) => sum+blog.likes, 0);
}

const favouriteBlog = (blogs) =>{
    if(blogs.length === 0) return null;

    return blogs.reduce((favorite, blog) => {
        return (favorite.likes || 0) < blog.likes ? blog : favorite;
      });
}

const mostBlogs = (blogs) =>{
    if(blogs.length === 0) return null;

    const authorNumber = blogs.reduce((countMap, blog) =>{
        countMap[blog.author] = (countMap[blog.author] || 0 ) + 1
        return countMap
    }, {})

    const mostAuthor = Object.entries(authorNumber).reduce((max, [author, count]) =>{
        return count > max.count? {author, count} : max
    }, {author: null, count:0})

    return mostAuthor.author ? { author: mostAuthor.author, blogs: mostAuthor.count } : null;
}

const mostLike = (blogs)=>{
    if(blogs.length === 0) return null

    const authorLike = blogs.reduce((likeMap, blog)=>{
        likeMap[blog.author] = (likeMap[blog.author] || 0) + blog.likes
        return likeMap
    }, {})

    const topAuthor = Object.entries(authorLike).reduce((max, [author, likes]) =>{
        return likes > max.likes ? {author, likes} : max
    }, {author:null, likes:0})

    return topAuthor.author ? {author:topAuthor.author, likes:topAuthor.likes} : null

}
  
module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLike
  };