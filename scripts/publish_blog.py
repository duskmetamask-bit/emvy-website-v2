#!/usr/bin/env python3
"""Publish a blog post to emvyai.com/blog via the API.

Called by Maya's cron after writing the daily blog post.

Usage:
    python3 publish_blog.py --title "..." --slug "..." --summary "..." [--vertical trades|professional-services|general] [--keyword "target seo keyword"]
"""

import argparse
import json
import urllib.request
import urllib.error
import os

API_URL = os.environ.get('BLOG_API_URL', 'https://emvyai.com/api/blog')

def publish(title: str, slug: str, summary: str, vertical: str = 'general', keyword: str = '', body: str = ''):
    payload = {
        'title': title,
        'slug': slug,
        'summary': summary,
        'body': body,
        'vertical': vertical,
        'targetKeyword': keyword,
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode(),
        method='POST',
        headers={'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            print(f"✅ Published: {result['post']['title']}")
            return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Publish a blog post')
    parser.add_argument('--title', required=True)
    parser.add_argument('--slug', required=True)
    parser.add_argument('--summary', required=True)
    parser.add_argument('--vertical', choices=['trades', 'professional-services', 'general'], default='general')
    parser.add_argument('--keyword', default='')
    parser.add_argument('--body', default='')
    args = parser.parse_args()
    publish(args.title, args.slug, args.summary, args.vertical, args.keyword, args.body)
