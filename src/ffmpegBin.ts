/**
 * ffmpeg导出文件的方法
 */

import * as util from 'util';
import * as cp from 'child_process';

const exec = util.promisify(cp.exec);

// eslint-disable-next-line max-len
// const COMMAND = `ffmpeg -i ${video} -i ${audio} -c:v copy -c:a aac -strict experimental ${output}`

export default async function ffmpegExport(
  video: string,
  audio: string,
  output: string,
): Promise<any> {
  await exec(`ffmpeg -i "${video}" -i "${audio}" -c:v copy -c:a aac -strict experimental "${output}"`);
}
