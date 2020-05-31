#! /usr/bin/env node

import * as inquirer from 'inquirer';
import { Spinner } from 'clui';
import * as path from 'path';

import validateEnv from './validateEnv';
import BiliParser, { VideoType } from './BiliParser';
import batchPerform, { taskType } from './batchPerform';
import ffmpegBin from './ffmpegBin';
import * as fs from './util/fs';


/**
 * 将生成结果转换为字符串
 * @param tasks 最终生成的任务
 */
// eslint-disable-next-line import/prefer-default-export
function tasksToString(tasks: taskType<VideoType>[]): string {
  // 转换成按照No排列的
  tasks.sort((prevTask, nextTask) => prevTask.payload.no - nextTask.payload.no);

  let str = '';

  // 累计成功数量
  const successCount = tasks.reduce(((totalCount, currentTask) => {
    if (currentTask.success === true) {
      return totalCount + 1;
    // eslint-disable-next-line no-else-return
    } else {
      return totalCount;
    }
  }), 0);

  str += '任务完成情况' + successCount + '/' + tasks.length + '\r\n';

  tasks.forEach((task) => {
    str += task.payload.no + '): 处理结果 -> ';
    if (task.success === true) {
      str += '成功\r\n'
        + '文件保存路径: ' + task.payload.destPath;
    } else {
      str += '失败\r\n'
        + '失败原因为: ' + task.errorInfo;
    }
    str += '\r\n';
  });

  return str;
}

const run = async (): Promise<void> => {
  console.time('run');

  // 1.程序检查
  await validateEnv();

  const biliParser = new BiliParser(process.cwd());
  await biliParser.parse();

  // 2.目录准备
  // eslint-disable-next-line prefer-destructuring
  const videos = biliParser.videos;

  // 3.工作目录预览
  const perviewFolder: any = {
    type: 'confirm',
    message: '即将生成如下文件，请进行确认：\r\n' + videos.map((v) => v.destPath).join('\r\n') + '\r\n',
    name: 'isPerform',
    default: true, // 默认值
  };

  const { isPerform } = await inquirer.prompt(perviewFolder);

  if (isPerform === false) {
    return;
  }

  // 开启Spinner
  const spiner = new Spinner('生成文件中...');
  spiner.start();

  // 生成dest目录
  await fs.mkdir(path.join(biliParser.PATH, biliParser.videoTitle));

  // 4.开启多任务处理
  async function handleFFmpegExport(video: VideoType): Promise<any> {
    // 出错直接返回
    if (video.success === false) {
      throw Error(video.errorInfo);
    }

    // 正常处理
    const {
      videoPath,
      audioPath,
      destPath,
    } = video;
    await ffmpegBin(videoPath, audioPath, destPath);
  }
  const tasks = await batchPerform<VideoType>(videos, handleFFmpegExport);

  // 展示结果
  spiner.stop();
  console.log('==============处理完成，结果如下===============');
  console.log(tasksToString(tasks));
  console.timeEnd('run');

};

try {
  // 运行程序
  run();
} catch (error) {
  // 捕获到致命错误
  console.log('发生错误如下，请重新运行');
  console.log(error);
}
