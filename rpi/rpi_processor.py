import os
import random
import time
import json
from skylo_sender import SkyloSender
from audio_embedding_processor import AudioEmbeddingProcessor

print("Initializing Audio Embedding Processor")
processor = AudioEmbeddingProcessor()

print("Initializing Skylo sender")
skylo = SkyloSender()

print("Initialization complete")

already_processed_files = os.listdir('recordings')

while True:
    # wait for a recording file to appear in the recordings directory
    print("Waiting for recording file")
    recording_file = None
    while recording_file is None:
        files = os.listdir('recordings')
        for file in files:
            if file not in already_processed_files and os.path.getsize(f'recordings/{file}') > 100000:
                recording_file = file
                break
        time.sleep(0.1)

    start_processor_time = time.time()
    result: str = processor.get_result(f'recordings/{recording_file}')
    print(f"Recording {recording_file} | Result:", result, "Processing Time:", time.time() - start_processor_time)

    # delete the recording file
    os.remove(f'recordings/{recording_file}')
    already_processed_files.append(recording_file)


    if result is not None and result.lower() != 'silence' and result.lower() != 'noise':
        bird_data = {
            "n": result,
            "x": skylo.longitude + random.uniform(-0.00009, 0.00009),
            "y": skylo.latitude + random.uniform(-0.00009, 0.00009),
            "t": int(recording_file.split('.')[0])
        }

        bird_data_str = json.dumps(bird_data)
        print("Sending bird data:", bird_data_str)

        skylo.send(bird_data_str)