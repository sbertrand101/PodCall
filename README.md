<div align="center">

# PodCall

<a href="http://dev.bandwidth.com"><img src="https://s3.amazonaws.com/bwdemos/BW_Voice.png"/></a>
</div>

<div align="center"> 
<b>This application is outdated, but will be updated soon!</b><br><br>
</div> 

PodCall is a catapult-based app for streaming podcasts through phone calls

## Install

Run

```
git clone https://github.com/inetCatapult/PodCall.git
npm install
```

## Getting Started

* Install dependencies from npm,
* **get user id, api token and secret** - to use the Catapult API you need these data. You can get them [here](https://catapult.inetwork.com/pages/catapult.jsf) on the tab "Account",
* **Set DATABASE_URL, CATAPULT_USER_ID, CATAPULT_API_TOKEN and CATAPULT_API_SECRET** - you need to set these on your machine as environment variables.

## Usage

* When running with ngrok, set the call URL on the catapult application to the ngrok URL.
* When using Heroku, set the call URL to the Heroku App URL
