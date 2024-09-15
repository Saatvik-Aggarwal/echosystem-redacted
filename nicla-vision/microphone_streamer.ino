/*
  This example reads audio data from the on-board PDM microphones, and prints
  out the samples to the Serial console. The Serial Plotter built into the
  Arduino IDE can be used to plot the audio data (Tools -> Serial Plotter)

  Circuit:
  - Arduino Nano 33 BLE board, or
  - Arduino Nano RP2040 Connect, or
  - Arduino Portenta H7 board plus Portenta Vision Shield, or
  - Arduino Nicla Vision

  This example code is in the public domain.
*/

#include <PDM.h>
#define AUDIO_BUFFER_SIZE 512

// default number of output channels
static const char channels = 1;

// default PCM output frequency
static const int frequency = 44100;

// Buffer to read samples into, each sample is 16-bits
short sampleBuffer[AUDIO_BUFFER_SIZE];

// Number of audio samples read
volatile int samplesRead;

void writeBlue(bool x) {
  digitalWrite(LEDB, !x);

}

void setup() {
  Serial.begin(921600);
  while (!Serial);

  // Configure the data receive callback
  PDM.onReceive(onPDMdata);

  // Optionally set the gain
  // Defaults to 20 on the BLE Sense and 24 on the Portenta Vision Shield
  // PDM.setGain(30);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(LEDB, OUTPUT);
  // pinMode(LEDR, OUTPUT);
  
  // Initialize PDM with:
  // - one channel (mono mode)
  // - a 16 kHz sample rate for the Arduino Nano 33 BLE Sense
  // - a 32 kHz or 64 kHz sample rate for the Arduino Portenta Vision Shield
  if (!PDM.begin(channels, frequency)) {
    Serial.println("Failed to start PDM!");
    while (1);
  }
}


bool a = false;
void loop() {
  // Wait for samples to be read
  if (samplesRead) {

      Serial.write((uint8_t *)sampleBuffer, samplesRead * sizeof(short));  
      Serial.flush();
      a = !a;
      samplesRead = 0;

      writeBlue(false);
      digitalWrite(LED_BUILTIN, a);
  }
}

/**
 * Callback function to process the data from the PDM microphone.
 * NOTE: This callback is executed as part of an ISR.
 * Therefore using `Serial` to print messages inside this function isn't supported.
 * */
void onPDMdata() {
  if (samplesRead != 0) {
    writeBlue(true);
  }
  // Query the number of available bytes
  int bytesAvailable = PDM.available();
  // Read into the sample buffer
  PDM.read(sampleBuffer, bytesAvailable);

  // 16-bit, 2 bytes per sample
  samplesRead = bytesAvailable / 2;
}
