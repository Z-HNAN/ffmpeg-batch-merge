# ffmpeg-batch-merge

用来批量合并视频与音频文件

# 平台依赖 ffmpeg

[ffmpeg](http://ffmpeg.org/)

做了一个node脚本去使用ffmpeg批量生成

## 使用方式

> 保证平台安装`ffmpeg`,并且可以使用命令 `ffpmeg -version`

下载后的基本准备

```bash
# 安装相关依赖
npm install

# 编译文件
npm run build

# 关联文件
npm link
```

找到音视频分开的目录,如`bili`

```plain
├─1                   
│      85150831.info  
│      85150831_1.xml 
│      audio1.mp4     
│      video.mp4      
│                     
├─2                   
│      85150831.info  
│      85150831_2.xml 
│                     
├─3                   
│      85150831.info  
│      85150831_3.xml 
│      audio1.mp4     
│      video.mp4      
│                     
└─4                   
        85150831.info 
        85150831_4.xml
        audio1.mp4    
        video.mp4     
```

进入到根目录后,可以看到文件夹`1`,`2`,`3`...

之后运行命令`ffmpeg-batch-merge`即可自动进行合并

