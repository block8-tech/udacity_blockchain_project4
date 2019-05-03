# Udacity Blockchain Developer Nanodegree - Project 4 - Build a Private Blockchain Notary Service


This project exposes a [levelDB](https://github.com/Level/level) blockchain database to a publicly accessible API.
I have built the API on top of the popular NodeJS minimal framework [ExpressJS](https://expressjs.com/). 


## How to use this API:

#### Install the code
1. Download OR clone this GitHub repository
2. Open a terminal or command-prompt and navigate to the directory where this repository was saved and type: `npm install`
3. From terminal or command-prompt (remaining in the same directory as above) type: `node app.js`


## Submit your wallet address to the API
To use this API you'll first need to register and validate your wallet address.
* Make a `POST` request to: `http://localhost:8000/requestValidation`
The request should contain: 
```
{ "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL" }
```

[Curl](https://curl.haxx.se/) example:
```
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
}'
```
You will recieve a response similar to this:
```
{
    "walletAddress": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "requestTimeStamp": "1544451269",
    "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544451269:starRegistry",
    "validationWindow": 300
}
```
You should then send use your preferred wallet or method to sign a message (e.g. [Electrum](https://electrum.org/))

## Submit a wallet signature to the API for verification
You are required to send a signed message to the API to validate that you are the owner of the wallet address.
* Make a `POST` request to: `http://localhost:8000/message-signature/validate`
The request should contain: 
```
{
"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
 "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}
```
[Curl](https://curl.haxx.se/) example:
```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
  "signature": "H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}'
```

You will receive a response similar to this:
```
{
    "registerStar": true,
    "status": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "requestTimeStamp": "1544454641",
        "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544454641:starRegistry",
        "validationWindow": 193,
        "messageSignature": true
    }
}
```
Upon validation your wallet address will be whitelisted and gain access to register a single star.


## Submit a star
The entire point of this API is to be able to register a star on the notary service!
* Make a `POST` request to: `http://localhost:8000/block`
The request should contain: 
```
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "68 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}
```
[Curl](https://curl.haxx.se/) example:
```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
  "star": {
      "dec": "68 52' 56.9",
      "ra": "16h 29m 1.0s",
      "story": "Found star using https://www.google.com/sky/"
  }
}'
```

The API will verify that your wallet address has been verified and whitelisted - if valid then you'll receive a response similar to this:
```
{
    "hash": "8098c1d7f44f4513ba1e7e8ba9965e013520e3652e2db5a7d88e51d7b99c3cc8",
    "height": 1,
    "body": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1544455399",
    "previousBlockHash": "639f8e4c4519759f489fc7da607054f50b212b7d8171e7717df244da2f7f2394"
}
```

## Get block by hash
* Make a `GET` request to: `http://localhost:8000/stars/hash:[HASH]`
The response should look similar to this: 
```
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

## Get block by wallet address
* Make a `GET` request to: `http://localhost:8000/stars/address:[ADDRESS]`
The response should look similar to this: 
```
[
  {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  },
  {
    "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
    "height": 2,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "17h 22m 13.1s",
        "dec": "-27° 14' 8.2",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532330848",
    "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
  }
]
```

## Get a block from the database
* Make a `GET` request from a web browser or via a utility of your choice such as [Curl](https://curl.haxx.se/) or [PostMan](https://www.getpostman.com/).
The request endpoint follows the structure: `localhost:8000/block/[block-index]`
* Example `GET` request that will return the block at index 0 using curl:  `curl localhost:8000/block/0`


## Insert a new Block to the database

* Make a `POST` request with a single key value pair (the key must be named "body")
* Example `POST` request using curl: `curl -d "body=mock%20data" -X POST http://localhost:8000/block`

<br/>

## Errors 

* If you send a `POST` request without the correct body data (key = body), then you will receive an error message and your new block will NOT be created.

<br/>

Enjoy!
