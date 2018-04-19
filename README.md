# Instagrammer!

Have you ever wished you could integrate your Instagrams into other software easily? Have you ever wanted an RSS feed of your Instagrams? Do you just want quick personal access to your Instagrams via a URL without having to spin up an Instagram client with auth?

Welp, Instagrammer is here to help you. Sure, it fills a really niche need, but if you want to do something with your instagrams with another piece of software that has no ability to talk to Instagram, this is your jam.

## Features

* Fetch your Instagrams via RSS
* Fetch your Instagrams via JSON
* See your Instagrams in a web page
* Authorize multiple users to have each user's Instagrams pulled in

It basically just lets your instagrams be more accessible for other things.

![](https://user-images.githubusercontent.com/260/39016170-8a906bd6-43ed-11e8-877f-f8c62352ad25.png)

## Setup

Clone down this repo or use the docker container.

Instagrammer runs on port `3001` by default.

### Instagram Developer Credentials

You'll need to go to the [Instagram Developer Console](https://instagram.com/developers) and create a new app. Once you've done that and gotten your `CLIENT_ID` and `CLIENT_SECRET` you can start setting up Instagrammer.

**Protip**: Make sure you enter the right callback URL when creating the Instagram app, so that auth can complete correctly. Check the host and port you'll be accessing Instagrammer with before doing this.


### Raw

* Make sure you have node.js and yarn installed.
* Clone down the repo.
* Create a `.env` file based on the .env.example file
* Enter your Instagram app credentials and optionally set a port (`PORT=3005`) Instagrammer will run on.
* `script/start`

Instagrammer will set it self up and start running.

### Docker

Running in Docker is the easiest.

Load up the container using your Instagram app credentials and optionally set the port.

```shell
docker run \
  --name instagrammer \
  --restart=always \
  -d \
  -p 3002:3002 \
  -e INSTAGRAM_CLIENT_ID='xxxx' \
  -e INSTAGRAM_CLIENT_SECRET='xxx' \
  -e PORT=3002 \
  jonmaddox/instagrammer
```

## How To Use

Get Instagrammer running and load it in  your browser. Click Sign In With Instagram to auth your account.

Instagrammer will fetch your last 20 photos and continually check for new photos every 10 minutes.

You can authorize as many users that you want. To do that, log out of your Instagram account, log into another account, and Sign In With Instagram on Instagrammer again. Voila, the second user will be added.
