# BLOGTECH Admin Panel — Production Client Deployment Guide

This comprehensive guide details the deployment, server configuration, environment setup, and verification procedures for the **BLOGTECH Admin Panel** frontend web application.

---

## 📋 Table of Contents
1. [Application Overview & Architecture](#1-application-overview--architecture)
2. [Pre-Packaged Deployment Artifact](#2-pre-packaged-deployment-artifact)
3. [Server & Hosting Requirements](#3-server--hosting-requirements)
4. [Deployment Method A: cPanel / Hostinger / LiteSpeed / Apache (Recommended)](#4-deployment-method-a-cpanel--hostinger--litespeed--apache-recommended)
5. [Deployment Method B: Nginx VPS / Dedicated Server](#5-deployment-method-b-nginx-vps--dedicated-server)
6. [Deployment Method C: Jamstack Platforms (Vercel, Netlify, Cloudflare Pages)](#6-deployment-method-c-jamstack-platforms-vercel-netlify-cloudflare-pages)
7. [Environment Configuration & API Base URL](#7-environment-configuration--api-base-url)
8. [Role-Based Access Control (RBAC) Reference](#8-role-based-access-control-rbac-reference)
9. [Media & Image Storage Architecture](#9-media--image-storage-architecture)
10. [Post-Deployment Verification Checklist](#10-post-deployment-verification-checklist)
11. [Troubleshooting & Common Questions](#11-troubleshooting--common-questions)

---

## 1. Application Overview & Architecture

* **Frontend Technology**: React 19, Vite 8, Tailwind CSS v4, Lucide React icons, Axios.
* **Routing Architecture**: HTML5 History API Single-Page Application (SPA) with URL path persistence (`/`, `/products`, `/services`, `/careers`, `/blogs`, `/settings`).
* **Production Build Output**: Static assets compiled into standard HTML, CSS, JavaScript, and image assets located in `dist/`.
* **Backend API Target**: `https://api.blogtec.co.in/api` (Laravel REST API running on LiteSpeed).
* **Authentication**: Bearer Token (Laravel Sanctum), securely stored in browser `localStorage`.

---

## 2. Pre-Packaged Deployment Artifact

The repository already contains a clean, optimized, production-ready build:

* **File Archive**: `dist.zip` (located in project root)
* **Build Directory**: `dist/`
  * `index.html` — Main HTML entry point.
  * `assets/index-*.js` — Minified, bundled React application.
  * `assets/index-*.css` — Minified Tailwind CSS stylesheet.
  * `.htaccess` — Pre-configured Apache / LiteSpeed rewrite rules for client-side routing.
  * `MAIN-LOGO.png` & `fav-icon.jpg` — Brand identity assets.

If you ever need to rebuild from source code:
```bash
npm install
npm run build
```

---

## 3. Server & Hosting Requirements

| Requirement | Specification | Notes |
| :--- | :--- | :--- |
| **Web Server** | Apache 2.4+ / LiteSpeed / Nginx / Caddy | Must support URL rewriting to `index.html`. |
| **SSL / HTTPS** | Valid SSL Certificate (Let's Encrypt, Cloudflare) | **Required**. Sanctum API Bearer tokens must be transmitted securely over HTTPS. |
| **Apache Modules** | `mod_rewrite`, `mod_headers`, `mod_deflate` / `mod_brotli`, `mod_expires` | Standard on 99% of cPanel, Hostinger, and shared hosts. |
| **Node.js** | Not required on runtime hosting server | The compiled `dist` bundle is 100% static client-side code. |

---

## 4. Deployment Method A: cPanel / Hostinger / LiteSpeed / Apache (Recommended)

This is the fastest method for deploying on Hostinger, cPanel, or any LiteSpeed/Apache host (e.g. `admin.blogtec.co.in` or `blogtec.co.in/admin`).

### Step-by-Step Instructions:

1. **Log in to Hosting Control Panel**:
   * Open your cPanel or Hostinger hPanel.
   * Open **File Manager**.

2. **Navigate to the Target Directory**:
   * For subdomain (e.g. `admin.blogtec.co.in`): Navigate to the subdomain folder (e.g. `public_html/admin` or `domains/admin.blogtec.co.in/public_html`).
   * For primary domain: Navigate to `public_html`.

3. **Upload the Build Archive**:
   * Click **Upload** and select `dist.zip` from your computer.

4. **Extract the Archive**:
   * Right-click `dist.zip` and select **Extract**.
   * Move the extracted files so that `index.html` and `.htaccess` reside directly in your web root (not inside an extra nested `dist/` folder).

5. **Ensure Hidden Files are Enabled**:
   * In File Manager Settings, enable **Show Hidden Files (dotfiles)**.
   * Verify that the `.htaccess` file is present in the folder.

### The Included `.htaccess` File:
The `.htaccess` included with the build automatically:
* Redirects all sub-routes to `index.html` so refreshing `/blogs` or `/careers` does not result in a 404.
* Passes `Authorization: Bearer <token>` headers cleanly.
* Blocks directory browsing (`Options -Indexes`).
* Enables Gzip and Brotli compression.
* Sets optimal browser caching for static JS/CSS assets (`max-age=31536000`).

---

## 5. Deployment Method B: Nginx VPS / Dedicated Server

If hosting on an Ubuntu/Debian VPS with Nginx:

1. **Upload Files**:
   Copy the contents of `dist/` to your server directory (e.g. `/var/www/admin-panel`):
   ```bash
   scp -r dist/* user@your-server-ip:/var/www/admin-panel/
   ```

2. **Configure Nginx Server Block**:
   Create or edit `/etc/nginx/sites-available/admin-panel`:

   ```nginx
   server {
       listen 80;
       server_name admin.blogtec.co.in;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name admin.blogtec.co.in;

       ssl_certificate /etc/letsencrypt/live/admin.blogtec.co.in/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/admin.blogtec.co.in/privkey.pem;

       root /var/www/admin-panel;
       index index.html;

       # Security Headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;

       # Gzip Compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

       # Static Asset Caching
       location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|woff|woff2)$ {
           expires 1y;
           access_log off;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }

       # SPA Fallback Routing: Route all URLs to index.html
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Enable Site & Restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/admin-panel /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 6. Deployment Method C: Jamstack Platforms (Vercel, Netlify, Cloudflare Pages)

If hosting on modern cloud static platforms:

### Vercel:
Create `vercel.json` in root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
* **Build Command**: `npm run build`
* **Output Directory**: `dist`

### Netlify:
Create `public/_redirects`:
```
/*    /index.html   200
```
* **Build Command**: `npm run build`
* **Publish Directory**: `dist`

### Cloudflare Pages:
* Create `public/_redirects` with `/* /index.html 200`.
* Select **Vite** framework preset, Output directory `dist`.

---

## 7. Environment Configuration & API Base URL

The application automatically connects to the production API:
* **Default API Base URL**: `https://api.blogtec.co.in/api`
* Configured in [`src/utils/main.service.js`](file:///Users/nikhilkumars/Desktop/Domain%20Dude/BLOGTECH/Web%20Development/admin-panel/src/utils/main.service.js):
  ```javascript
  export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'https://api.blogtec.co.in/api';
  ```

### Changing the Backend URL:
If you need to connect to a different staging or testing API, create a `.env.production` file in the project root before building:
```env
VITE_API_BASE_URL=https://staging-api.blogtec.co.in/api
```
Then run:
```bash
npm run build
```

---

## 8. Role-Based Access Control (RBAC) Reference

The admin panel enforces multi-tiered access control based on the user's role returned by `GET /admin/me`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROLE PERMISSION MATRIX                          │
├──────────────────────┬─────────────┬─────────────┬─────────────────────┤
│ Feature / Module     │ Super Admin │ Admin       │ Editor              │
├──────────────────────┼─────────────┼─────────────┼─────────────────────┤
│ Dashboard Metrics    │ Full Access │ Full Access │ Full Access         │
│ Products Catalog     │ Full Access │ Full Access │ Restricted (Hidden) │
│ Services Catalog     │ Full Access │ Full Access │ Restricted (Hidden) │
│ Careers Vacancies    │ Full Access │ Full Access │ Full Access         │
│ Blogs & Categories   │ Full Access │ Full Access │ Full Access         │
│ Profile & Password   │ Self        │ Self        │ Self                │
│ Administrator Users  │ Full Access │ No Access   │ No Access           │
│ Roles & Permissions  │ Full Access │ No Access   │ No Access           │
└──────────────────────┴─────────────┴─────────────┴─────────────────────┘
```

* **Editor Experience**:
  * Sidebar shows only **Dashboard**, **Careers**, **Blogs**, and **Settings**.
  * The command palette excludes product and service navigation items.
  * Direct URL access to `/products` or `/services` automatically redirects to `/dashboard` with an access alert.
  * The article author always resolves to the current logged-in editor's name.

---

## 9. Media & Image Storage Architecture

### How Uploads Work:
* **Featured Image**: Uploaded atomically as `featured_image` (`multipart/form-data`).
* **Gallery Photos**: Uploaded atomically as `gallery_images[]` (multiple files).
* **Storage Location**: Stored on backend LiteSpeed server at `/storage/products/` and `/storage/services/`.

### Public URL Resolution:
* Images are served from: `https://api.blogtec.co.in/storage/`
* Streaming fallback: `https://api.blogtec.co.in/api/storage/` (with CORS headers enabled)
* Offline SVG fallback: Automatically generates responsive inline placeholder SVG if an image is missing or unreachable.

---

## 10. Post-Deployment Verification Checklist

Complete these 10 tests immediately after deploying to confirm proper installation:

- [ ] **1. Login Page**: Visit the admin domain. Verify the login form loads with clean branding and icons.
- [ ] **2. Authentication**: Log in with administrative credentials. Verify successful redirect to the Dashboard.
- [ ] **3. URL Refresh Test (Critical)**: Navigate to `/careers`, `/blogs`, and `/settings`. Press browser **Hard Refresh (Ctrl + F5 / Cmd + Shift + R)** on each. Verify it reloads cleanly without 404 Not Found errors.
- [ ] **4. Career Creation**: Create a career vacancy. Verify Department and Employment Type accept text input, and the position saves.
- [ ] **5. Product Media Upload**: Create a product, drag & drop a featured thumbnail, and stage gallery images. Save and verify that images upload and display in the catalog grid.
- [ ] **6. Blog Author Verification**: Open Create Blog. Verify the author displays the logged-in administrator's name. Save a draft and verify author persists.
- [ ] **7. Profile Update**: Go to Settings > Profile. Update your name. Confirm the header avatar and sidebar label update immediately.
- [ ] **8. Security / Password**: Go to Settings > Security. Verify password change validation.
- [ ] **9. Super Admin Users (Super Admin Only)**: Go to Settings > Admin Users. Verify administrator list, role badges, and status toggle buttons.
- [ ] **10. Editor Role Verification**: Log in as an editor. Verify Products and Services are absent from the sidebar and `/products` redirects to `/dashboard`.

---

## 11. Troubleshooting & Common Questions

### Q: Page shows 404 Not Found when refreshing pages like `/blogs` or `/careers`
* **Cause**: Web server is looking for a physical directory named `/blogs/index.html`.
* **Fix**: Ensure `.htaccess` is uploaded to the root directory on Apache/LiteSpeed, or ensure `try_files $uri $uri/ /index.html;` is present in Nginx configuration.

### Q: Image uploads fail with 413 "Payload Too Large"
* **Cause**: Server PHP or web server upload limit is lower than the image file size.
* **Fix**: In backend `php.ini` or cPanel MultiPHP INI Editor, increase:
  ```ini
  upload_max_filesize = 20M
  post_max_size = 25M
  memory_limit = 256M
  ```

### Q: API requests return 401 Unauthorized after deploying to a new domain
* **Cause**: Session expired or CORS headers on backend do not allow the new frontend origin.
* **Fix**: Ensure your backend CORS config (`config/cors.php` in Laravel) includes your frontend domain in `allowed_origins` (e.g. `https://admin.blogtec.co.in`).

### Q: How do I change the website logo or favicon?
* Replace `public/MAIN-LOGO.png` and `public/fav-icon.jpg` with your company assets and re-run `npm run build`.

---

*Documentation prepared for BLOGTECH Client Engineering & Deployment Operations.*

