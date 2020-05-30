import path from 'path';
import BiliParser from '../src/BiliParser';


describe('test BiliParser', () => {
  // 初始化
  const biliParser = new BiliParser(path.join(__dirname, './demo'));

  beforeAll(async () => {
    await biliParser.parse();
  });

  test('test Title', () => {
    expect(biliParser.videoTitle).toBe('【项目实战】node.js网络爬虫');
  });

  test('test dirs', () => {
    expect(biliParser.dirs).toEqual([
      'G:\\open_source\\ffmpeg-batch-merge\\github\\tests\\demo\\1',
      'G:\\open_source\\ffmpeg-batch-merge\\github\\tests\\demo\\2',
      'G:\\open_source\\ffmpeg-batch-merge\\github\\tests\\demo\\3',
      'G:\\open_source\\ffmpeg-batch-merge\\github\\tests\\demo\\4',
    ]);
  });

  test('test videos length', () => {
    expect(biliParser.videos.length).toBe(4);
  });

  test('test videos[0] success content', () => {
    expect(biliParser.videos[0]).toEqual({
      success: true, // 是否解析成功
      errorInfo: '', // 解析失败原因
      no: 1, // 视频的序号
      name: '1-1课程介绍', // 视频名称
      videoPath: 'G:\\open_source\\ffmpeg-batch-merge\\github\\tests\\demo\\1\\video.mp4', // video路径
      audioPath: 'G:\\open_source\\ffmpeg-batch-merge\\github\\tests\\demo\\1\\audio1.mp4', // audio路径
      destPath: 'G:\\open_source\\ffmpeg-batch-merge\\github\\tests\\demo\\1\\1.1-1课程介绍.mp4', // 目标路径
    });
  });

  test('test videos[2] error content', () => {
    const videoError = biliParser.videos[1];
    expect(videoError.success).toBe(false);
    expect(videoError.errorInfo.length).toBeGreaterThan(0);
  });
});
