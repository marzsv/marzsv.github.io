# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal resume/CV site using the Online CV theme via jekyll-remote-theme. The site is hosted at marzsv.github.io.

## Development Commands

```bash
# Install dependencies
bundle install

# Run local development server (auto-regenerates on file changes)
bundle exec jekyll serve

# Build site without serving
bundle exec jekyll build
```

**Note:** Changes to `_config.yml` require restarting the server.

## Architecture

- **Theme:** sharu725/online-cv (remote theme)
- **Skin:** turquoise
- **Markdown processor:** kramdown

### Content Structure

- `_data/data.yml` - All resume content (experience, skills, projects, contact info)
- `_config.yml` - Site-wide configuration and theme settings

### Updating Resume Content

All resume data is centralized in `_data/data.yml`. Edit this file to update:
- Personal information (name, tagline, contact)
- Work experience
- Skills with proficiency levels
- Projects
- Languages

### Print Version

The theme provides a printable version at `/print` URL.

### Contact Protection (AES-256 Encryption)

Sensitive contact information (email, phone) is encrypted and requires a password to view.

**How it works:**
1. Contact data is encrypted with AES-256-GCM in the browser
2. Visitors see a "Unlock contact info" button
3. With the correct password, email and phone are decrypted and displayed
4. Session storage keeps it unlocked during the browser session

**To configure/update protected contact info:**

1. Open `tools/encrypt-contact.html` in your browser (locally, file://)
2. Enter your email and phone
3. Choose a password (share this only with people you want to see your contact)
4. Click "Generate Encrypted Data"
5. Copy the generated string
6. Paste it in `_data/data.yml` and `_data/data_es.yml` as `encrypted_contact` value
7. Commit and push

**To disable protection:** Remove `encrypted_contact` and restore `email`/`phone` fields directly.
