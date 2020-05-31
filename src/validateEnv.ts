/**
 * 验证当前环境
 */
import * as util from 'util';
import * as cp from 'child_process';

const exec = util.promisify(cp.exec);

async function validateFFmpeg(): Promise<void> {
  // 检查-version 是否可以完成
  await exec('ffmpeg -version');
}

// 检查环境
export default async function validateEnv(): Promise<void> {
  // 是否包含 FFmpeg
  await validateFFmpeg();
}
