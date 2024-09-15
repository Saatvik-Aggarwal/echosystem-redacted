import serial # pyserial
from time import sleep as delay

class SkyloSender:
    def __init__(self):
        self.ser = serial.Serial('/dev/ttyUSB0', 115200)
        self.ser.flush()
        self.writeln('AT')      
        self.waitFor('OK')
        self.writeln('AT+CFUN=0') # Disable radio

        # run this for satellite and gps connection (need to be outside)
        # self.writeln('AT%RATACT="NBNTN","1"')
        # self.waitFor('OK')
        # self.writeln('AT%IGNSSACT=1')
        # res = self.waitfor(',,,') # example: %IGNSSEVU: "FIX",1,"23:46:08","14/09/2024","42.359270","-71.096172","-39.6",1726357568000,,,"B",5
        # self.longitude = float(res.split(',')[4])
        # self.latitude = float(res.split(',')[5])

        self.waitFor('OK')
        self.writeln("AT+CEREG=2") # Enable network registration status
        self.waitFor('OK')
        self.writeln("AT+CFUN=1") # Enable radio
        self.waitFor('OK')
        print("Waiting for CEREG: 5")
        self.waitFor("+CEREG: 5", 300)
        print("Connected to network!!!")
        self.writeln('AT%SOCKETCMD="ALLOCATE",1,"UDP","OPEN","104.237.145.140",12345,0')
        self.waitFor('OK')
        self.writeln('AT%SOCKETCMD="SETOPT",1,36000,1')
        self.waitFor('OK')
        self.writeln('AT%SOCKETCMD="ACTIVATE",1')
        self.waitFor('OK')

        self.writeln('AT%SOCKETCMD="INFO",1')
        self.waitFor('OK')

        # hardcode so we can demo this indoors
        self.latitude = 42.35843998758309
        self.longitude = -71.09642502928307

    def send(self, message: bytes):
        if type(message) == str:
            message = message.encode()

        # example for Hello, world!
        # AT%SOCKETDATA="SEND",1,13,"48656C6C6F2C20776F726C6421"
        message_hex = message.hex()
        message_len = len(message)
        self.writeln(f'AT%SOCKETDATA="SEND",1,{message_len},"{message_hex}"')
        self.waitFor('OK')


    def writeln(self, message: str):
        print("WRITE:", message)
        self.ser.write(message.encode() + b'\r\n')

        resp = self.ser.readline() # read the echo
        print("READ: "+ resp.decode(), end='')

        
    def waitFor(self, message: str, max_lines=99):
        response = ""
        print("READ: ", end='')
        while True:
            r = self.ser.read_all().decode()
            if r is not None and r.strip() != '':
                print(r, end='')
                response += r

            if message.strip().lower() in response.strip().lower() or 'ERROR' in response:
                return response

            if len(response.split('\n')) > max_lines:
                return response

    def close(self):
        self.writeln('AT%SOCKETCMD="DELETE",1')
        self.ser.close()        
    

if __name__ == '__main__':
    sender = SkyloSender()
    sender.send('HELLO AMAZING WORLD!')
    sender.close()
    print('done')
    
