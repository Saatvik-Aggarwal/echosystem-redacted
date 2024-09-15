# read raw audio data from serial port

import os
import serial
import wave
import time

OUTPUT_DIR = 'recordings'

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

ser = serial.Serial('/dev/ttyACM0', 921600)
# ser.open()
# listen to it for five seconds and then log it into a .wav file

sampling_freq = 44100
duration = 10 # seconds

total_samples = duration * sampling_freq
size_per_sample = 2

print(f'Recording {duration} seconds of audio at {sampling_freq} Hz on {ser.name}. PID: {os.getpid()}')

while True:    
    # name the output file {milliseconds_since_epoch}.wav
    filename = f'{OUTPUT_DIR}/{int(time.time() * 1000)}.wav'

    # open the file for writing
    wf = wave.open(filename, 'wb')
    wf.setnchannels(1)
    wf.setsampwidth(size_per_sample)
    wf.setframerate(sampling_freq)
    wf.setnframes(total_samples)

    wf.writeframes(ser.read(total_samples * size_per_sample))
    wf.close()