const posts = require('../src/pages/posts')
const commander = require('commander')
const chalk = require('chalk')
const ora = require('ora')
const { storage, histroy } = require('../src/utils')
const checkLog = new ora('check params...')
const fetchLog = new ora()
// parse id
commander
  .option('-s, --silence', 'silence mode, hidden all comments')
  .parse(process.argv)
const silence = commander.silence || false

const show = p => {
  fetchLog.clear()
  fetchLog.info(`post: ${p.id}`)
  console.log(chalk.black.bgWhite.bold(` -${p.title}- \n`))
  console.log(`${p.content} \n`)
  if (!silence && p.comments && p.comments.length) {
    console.log('Comments:')
    p.comments.forEach((comment, index) => {
      console.log(chalk.bold(`-----------\n[${index}] ${comment.member}: `), `${comment.content}\n`)
    })
  }
  histroy.add('post', `${p.id}||${p.once}||${p.title}`)
}
const findPost = async(id) => {
  checkLog.stop()
  fetchLog.start(`fetching... post.${id}`)
  try {
    const post = await posts.show(id)
    fetchLog.clear()
    if (!post) return fetchLog.fail('No content')
    show(post)
  } catch (e) {
    fetchLog.fail(`err: ${String(e)}`)
  }
}

// check id
(async() => {
  checkLog.start()
  const id = commander.args[0]
  if (!id) return checkLog.fail('id is required')
  
  const postsStorage = await storage.get('posts');
  if (!postsStorage) {
    console.log('Please use v2 show first.');
  }

  // post => [id, title, re, author]
  const post = postsStorage[id];
  if (post && post[0]) {
    return await findPost(post[0]);
  }

  await findPost(id);
})()
