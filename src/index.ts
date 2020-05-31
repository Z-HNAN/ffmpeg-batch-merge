#! /usr/bin/env node

import inquirer from 'inquirer';

import validateEnv from './validateEnv';
import BiliParser, { VideoType } from './BiliParser';
import batchPerform, { taskType } from './batchPerform';
import ffmpegBin from './ffmpegBin';


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

  str += '任务完成情况' + successCount + '/' + tasks.length;

  tasks.forEach((task) => {
    str += task.payload.no + '): 处理结果 -> ';
    if (task.success === true) {
      str += '成功\r\n'
        + '文件保存路径: ' + task.payload.destPath;
    } else {
      str += '失败\r\n'
        + '失败原因为: ' + task.errorInfo;
    }
  });

  return str;
}

const run = async (): Promise<void> => {
  console.time('run');

  // 1.程序检查
  await validateEnv();

  const biliParser = new BiliParser();
  await biliParser.parse();

  // 2.目录准备
  // eslint-disable-next-line prefer-destructuring
  const videos = biliParser.videos;

  // 3.工作目录预览
  const perviewFolder: any = {
    type: 'confirm',
    message: '即将生成如下文件，请进行确认：\r\n' + videos.map((v) => v.destPath),
    name: 'isPerform',
    default: true, // 默认值
  };

  const { isPerform } = await inquirer.prompt(perviewFolder);

  if (isPerform === false) {
    return;
  }

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
