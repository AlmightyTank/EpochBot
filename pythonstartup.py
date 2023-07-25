#!/usr/bin/env python3

# Retweet bot for Twitter, using Python and Tweepy.
# Search query via hashtag or keyword.pp
# Author: Chris C. Young || AlmightyTank_
# Date: Monday, July 26th - 2021.
# License: MIT License.

import tweepy
from time import sleep
# Import in your Twitter application keys, tokens, and secrets.
# Make sure your keys.py file lives in the same directory as this .py file.
from keys import *

auth = tweepy.OAuthHandler(API_KEY, API_SECRET_KEY)
auth.set_access_token(ACCESS_TOKEN, SECRET_ACCESS_TOKEN)
api = tweepy.API(auth)

def rttanks():
    passes = 0
    # Where q='#example', change #example to whatever hashtag or keyword you want to search.
    # Where items(5), change 5 to the amount of retweets you want to tweet.
    # Make sure you read Twitter's rules on automation - don't spam!
    for tweet in tweepy.Cursor(api.search, q='@rttanks').items(3):
        status = api.get_status(tweet.id)
        retweeted = status.retweeted
        favorited = status.favorited 

        SOURCE_ID = 1418044846657441796
        MAIN_ID = 1306737720174219265

        passes += 1

        # user ID of the account 2
        target_id = tweet.user.id

        print('\nHonestly Idiot RTs Bot found tweet by @' + tweet.user.screen_name + ' - ', end = "")
        print(target_id, end = " - ")
        print('Pass', end = " = ")
        print(passes, end = "")
        print('. ' + 'Attempting to spread their message.')
        sleep(2)
        # getting the friendship details
        friendship = api.show_friendship(SOURCE_ID = SOURCE_ID, target_id = target_id)
        if target_id == SOURCE_ID:
            try:
                print('We found one of our own tweets again disregarding it.')
                sleep(5)
            except tweepy.TweepError as error:
                if error.api_code == 187:
                    # Do something special
                    print('Duplicate message')
                    sleep(5)
                    continue
                if error.api_code == 139:
                    # Do something special
                    print('You have already favorited this status.')
                    sleep(5)
                    continue
                if error.api_code == 429:
                    # Do something special
                    print('You idiot you checked two many tweets: you were being a little too spammy.')
                    sleep(900)
                    continue
                if not (error.api_code == 429 or 327 or 187):
                    print('Error. Favoriting not successful. Reason: ')
                    print(error.reason)
                    sleep(5)
                    continue
        if not target_id == SOURCE_ID:
            if friendship[0].followed_by == False:
                print("They have not followed you.")
                sleep(5)
            else:
                print("They have followed you", end = ", and ")
                if friendship[0].following == False:
                    print("so ill follow them back.")
                    api.create_friendship(target_id)
                else:
                    print("we are already following them.")
                    sleep(5)
            if tweet.retweeted == False:
                try:
                    tweet.retweet()
                    print('Retweet published successfully.')
                    sleep(5)
                except tweepy.TweepError as error:
                    if error.api_code == 187:
                        # Do something special
                        print('Duplicate message.')
                        sleep(5)
                        continue
                    if error.api_code == 327:
                        # Do something special
                        print('You have already retweeted this status.')
                        sleep(5)
                        continue
                    if error.api_code == 429:
                        # Do something special
                        print('You idiot you checked two many tweets: you were being a little too spammy.')
                        sleep(900)
                        continue
                    if not (error.api_code == 429 or 327 or 187):
                        print('Error. Retweeting not successful. Reason: ')
                        print(error.reason)
                        sleep(5)
                        continue
                # Where sleep(10), sleep is measured in seconds.
                # Change 10 to amount of seconds you want to have in-between retweets.
                # Read Twitter's rules on automation. Don't spam!
                # sleep(10)

while True:
    try:
        rttanks()
        print('\nRestarting with a no more breaks')
        # sleep(10)
    except tweepy.TweepError as error:
        if error.api_code == 187:
            # Do something special
            print('Duplicate message.')
            sleep(5)
            continue
        if error.api_code == 327:
            # Do something special
            print('You have already retweeted this status.')
            sleep(5)
            continue
        if error.api_code == 429:
            # Do something special
            print('You idiot you checked two many tweets: you were being a little too spammy.')
            sleep(900)
            continue
        if not (error.api_code == 429 or 327 or 187):
            print('Error. Retweeting not successful. Reason: ')
            print(error.reason)
            sleep(5)
            continue
