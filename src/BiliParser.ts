/**
 * bilibili下载文件夹目录解析
 */
// import fs from 'fs';
import path from 'path';
import * as fs from './util/fs';

type VideoType = {
  success: boolean; // 是否解析成功
  errorInfo: string; // 解析失败原因
  no: number; // 视频的序号
  name: string; // 视频名称
  videoPath: string; // video路径
  audioPath: string; // audio路径
  destPath: string; // 目标路径
};

const EMPTY_VIDEO: VideoType = {
  success: false,
  errorInfo: '',
  no: -1,
  name: '',
  videoPath: '',
  audioPath: '',
  destPath: '',
};


class BiliParser {
  // 当前解析器作用位置
  PATH: string;

  // 视频标题
  videoTitle: string;

  // 所有需要解析的文件目录
  dirs: string[] = [];

  // 所有视频结果
  videos: VideoType[];

  constructor(currentDir?: string) {
    // 更改PATH指向
    if (currentDir) {
      this.PATH = currentDir;
    } else {
      this.PATH = __dirname;
    }
  }

  // 解析操作
  async parse(): Promise<void> {
    // 解析到所有的预备文件夹
    await this.parseDirs();

    if (this.dirs.length === 0) {
      throw Error(`${this.PATH}目录下未检测到合适的文件夹`);
    }

    // 解析所有的videos
    await this.parseVideos();

    // 解析视频标题videoTitle
    await this.parseTitle();
  }

  // 解析所有的文件夹
  async parseDirs(): Promise<void> {
    this.dirs = await fs.readPureDir(this.PATH);
  }

  // 解析视频标题
  async parseTitle(): Promise<void> {
    // 获取第一个成功视频
    const { destPath } = this.videos.find((v) => v.success === true);
    // 获取所在的文件夹绝对路径
    const dirAPath = path.join(destPath, '..');
    const dirs = await fs.readdir(dirAPath);
    const videoInfoFileContent = (await fs.readFile(
      path.join(dirAPath, dirs.find((d) => /info$/.test(d))),
    )).toString();
    this.videoTitle = this.parseVideoContentTitle(JSON.parse(videoInfoFileContent));
  }

  // 解析所有的video
  async parseVideos(): Promise<void> {
    const videoPromise: Promise<VideoType>[] = [];
    // 并行发出请求
    this.dirs.forEach((dir) => videoPromise.push(this.paeseVideo(dir)));
    // 等待请求
    this.videos = await Promise.all(videoPromise);
  }

  // 解析单个video目录
  async paeseVideo(videoDir: string): Promise<VideoType> {
    // 检验目录
    const validateResult = await this.validateVideoDir(videoDir);
    if (validateResult === 'error') {
      const errorInfo = '缺少视频/音频文件' + videoDir + ':\r\n'
        + '如果该文件夹并不属于bilibili下载内容请予以忽略. \r\n'
        + '如果该文件夹确实为bilibili下载内容，请向作者反馈.';
      return {
        ...EMPTY_VIDEO,
        success: false,
        errorInfo,
      };
    }
    const dirs = await fs.readdir(videoDir);
    // 解析文件info
    const videoInfoFileContent = (await fs.readFile(
      path.join(videoDir, dirs.find((d) => /info$/.test(d))),
    )).toString();
    const videoInfo = this.parseVideoContentInfo(JSON.parse(videoInfoFileContent));

    const videoPath = path.join(videoDir, this.getVideoFile(dirs));
    const audioPath = path.join(videoDir, this.getAudioFile(dirs));
    const destPath = path.join(videoDir, `${videoInfo.no}.${videoInfo.name}.mp4`);

    return {
      success: true,
      errorInfo: '',
      no: videoInfo.no,
      name: videoInfo.name,
      videoPath,
      audioPath,
      destPath,
    };
  }

  // 解析video名称
  parseVideoContentInfo(content: any): {
    no: number;
    name: string;
  } {
    return {
      no: Number(content.PartNo),
      name: content.PartName,
    };
  }

  // 解析vieo系列名称
  parseVideoContentTitle(content: any): string {
    return content.Title;
  }

  // 检验video-dir内其中的文件是否合法,之后会被插件插入
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validateVideoDir(videoDir: string): Promise<'success'|'warn'|'error'> {
    const dirs = await fs.readdir(videoDir);
    if (
      dirs.findIndex((d) => /video/.test(d)) === -1
        || dirs.findIndex((d) => /audio/.test(d)) === -1
    ) {
      return 'error';
    }

    if (dirs.findIndex((d) => /info$/.test(d)) === -1) {
      return 'warn';
    }

    return 'success';
  }

  // 获取video文件,之后会被插件插入
  getVideoFile(dirs: string[]): string {
    return dirs.find((d) => /video/.test(d));
  }

  // 获取audio文件,之后会被插件插入
  getAudioFile(dirs: string[]): string {
    return dirs.find((d) => /audio/.test(d));
  }
}

// 注入验证方法
export function injectValidateVideoDir(fn): void {
  BiliParser.prototype.validateVideoDir = fn;
}

// 注入返回符合条件的video名称
export function injectGetVideoFile(fn): void {
  BiliParser.prototype.getVideoFile = fn;
}

// 注入返回符合条件的audio名称
export function injectGetAudioFile(fn): void {
  BiliParser.prototype.getVideoFile = fn;
}


export default BiliParser;
