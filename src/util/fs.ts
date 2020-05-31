/**
 * promisify fs相关包装方法
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import * as util from 'util';
import * as path from 'path';
import * as fs from 'fs';

export const readFile = util.promisify(fs.readFile);
export const readdir = util.promisify(fs.readdir);
export const stat = util.promisify(fs.stat);
export const mkdir = util.promisify(fs.mkdir)

/**
 * 给定一个绝对目录，读取该目录下的所有文件夹内容
 */
export async function readPureDir(dir: string): Promise<string[]> {
  const pureDir: string[] = [];
  // 读取到该目录下所有内容
  const dirs = await readdir(dir);

  // 并发读取每个文件的状态
  const dirsStatePromise: Promise<fs.Stats>[] = [];
  // 进行异步处理promise
  dirs.forEach((fileRelativePath) => {
    const fileAbsolutePath = path.join(dir, fileRelativePath);
    dirsStatePromise.push(stat(fileAbsolutePath));
  });

  // 等待获取所有的读取的文件状态
  const dirsState = await Promise.all(dirsStatePromise);
  // 添加所有符合要求的文件夹
  dirsState.forEach((state, index) => {
    if (state.isDirectory() === true) {
      const fileAbsolutePath = path.join(dir, dirs[index]);
      pureDir.push(fileAbsolutePath);
    }
  });

  return pureDir;
}

export default {

};
