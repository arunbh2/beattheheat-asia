# BeatTheHeat.Asia — Heat, Work and the New Economy

This is the homepage for **beattheheat.asia**: a one-page invitation to an in-person Bangkok Climate Action Week session on 10 October 2026.

It is a plain website. There is nothing to install and nothing to "build". GitHub shows these files to visitors exactly as they are.

---

## What is in this folder

| File or folder | What it does | Do you need to edit it? |
|---|---|---|
| `index.html` | The words and structure of the page | **Yes, once**, to add your Google Form link |
| `styles.css` | The colours, fonts and layout | No |
| `images/` | The six photographs | Only if you want to change a photo |
| `CNAME` | Connects the site to the address beattheheat.asia | **No. Never delete this file.** |
| `README.md` | This guide | No |

There is no `script.js`. The page does not need any JavaScript.

---

## 1. Add your Google Form link (do this first)

Every **JOIN THE WAITLIST** button opens your Google Form in a new tab. Until you add your link, the buttons won't go anywhere.

### Step A — Copy your form link

1. Open your form in Google Forms.
2. Click the **Send** button (top right).
3. Click the **link icon** (it looks like 🔗).
4. Click **Copy**.

Your link will look something like this:

```
https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?usp=sf_link
```

(Google may offer a shorter `https://forms.gle/...` link. Either kind works.)

### Step B — Paste it into the page

1. On GitHub, open your repository and click **`index.html`**.
2. Click the **pencil icon** (✏️, "Edit this file") near the top right of the file.
3. Press **Ctrl + F** (Windows) or **Cmd + F** (Mac) to open the search box inside the editor.
4. Search for exactly this text:

   ```
   GOOGLE_FORM_URL_HERE
   ```

5. It appears **3 times**, once for each button:
   - **1 of 3**: the small button in the black bar at the top
   - **2 of 3**: the main button on the first screen
   - **3 of 3**: the button in the final section

   There is a comment just above each one that says `WAITLIST LINK 1 of 3` (and so on) so you can find them.

6. Replace each `GOOGLE_FORM_URL_HERE` with your form link. Change **only** that text and keep the quote marks around it.

   **Before:**
   ```html
   href="GOOGLE_FORM_URL_HERE"
   ```
   **After:**
   ```html
   href="https://forms.gle/AbCdEf123456"
   ```

7. Search for `GOOGLE_FORM_URL_HERE` again. If nothing is found, you've replaced all three.
8. Save the change (see **"Commit changes"** in section 3).

> **Tip:** Do not delete `target="_blank" rel="noopener noreferrer"` next to the link. That part makes the form open in a new tab.

---

## 2. Replace the photographs

The page uses the photos in the `images` folder. To change a photo, upload a new file with **exactly the same name**. The page picks it up automatically, so you don't need to edit any code.

| File name (must match exactly) | Where it appears on the page | Best shape |
|---|---|---|
| `IMAGE_01_HERO.jpg` | The big first-screen photo behind the title | Landscape (wide). Keep the main person right of centre, because the title sits on the left on laptops. |
| `IMAGE_02_WORK.jpg` | Beside "Heat does not stop at the thermometer." | Landscape or portrait. It is shown tall on laptops, so keep faces in the upper-middle. |
| `IMAGE_03_WOMEN_WORKERS.jpg` | The wide strip under the big question | Landscape. The top and bottom get trimmed, so keep faces around the middle. |
| `IMAGE_04_CITY_HEAT.jpg` | Beside "A heat warning is not protection." | Landscape |
| `IMAGE_05_CLOSING.jpg` | The final "Join the conversation" section | Landscape. Keep the main person on the **left**, because the text sits on the right on laptops. |
| `SOCIAL_SHARE_IMAGE.jpg` | The preview picture when someone shares the link on WhatsApp, LinkedIn and similar apps | Exactly **1200 × 630 pixels** |

**Important details:**

- Names must match **exactly**, including capital letters and `.jpg` at the end. `image_01_hero.jpg` or `IMAGE_01_HERO.jpeg` **will not work**.
- Use **JPG** files.
- Keep each photo under about **400 KB** so the page loads fast on phones. A free tool like **squoosh.app** will shrink a photo in your browser: drop the photo in, choose "MozJPEG", set quality to about 75, then download it.
- A width of about **1600–1800 pixels** is plenty.

---

## 3. How to upload files to GitHub (step by step)

You'll use this for new photos, or to replace all the website files at once.

1. **Open your repository.** Go to github.com, sign in, and open the repository that holds beattheheat.asia.
2. **Go to the right folder.**
   - For `index.html`, `styles.css` or `README.md`, stay on the main page of the repository.
   - For photos, click the **`images`** folder first.
3. **Upload.** Click **Add file** → **Upload files**. Then drag your files onto the page, or click "choose your files".
4. **Replace existing files.** If a file with the same name is already there, GitHub replaces it with your new one. That's what you want.
5. **Commit changes.** "Commit" is GitHub's word for **save**. Scroll down, write a short note in the box (for example, `Add waitlist link` or `Update hero photo`), keep **"Commit directly to the main branch"** selected, then click the green **Commit changes** button.
6. **Wait for the site to refresh.** GitHub Pages usually updates in **1–3 minutes**. To watch progress, open the **Actions** tab of your repository: a yellow dot means it is still working, and a green tick means it is done.
7. **Check the live site.** Open https://beattheheat.asia. If you still see the old version, your browser is showing a saved copy. Refresh with **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac), or open the page in a private or incognito window.

### If you are uploading the whole website for the first time

Upload these into the main page of the repository: `index.html`, `styles.css` and `README.md`. Then open the `images` folder (create it by uploading files as `images/...`, or drag the whole `images` folder into the upload box) and upload all six photos.

**Do not delete the `CNAME` file.** It keeps your beattheheat.asia address working.

---

## 4. Changing words on the page (optional)

All the words are in `index.html`. Open it with the pencil icon, use **Ctrl/Cmd + F** to find the sentence you want to change, edit only the words between the `>` and `<` symbols, then commit. The comments that start with `<!--` show which section you are in.

---

## 5. Quick checklist before you share the link

- [ ] Searched `index.html` for `GOOGLE_FORM_URL_HERE`, and nothing was found
- [ ] Clicked all three **Join the waitlist** buttons on the live site, and each one opened your form in a new tab
- [ ] Opened the site on your phone
- [ ] All six photos appear
- [ ] The Google Form is set to accept responses

---

## Privacy note

This website does not collect or store anything. Names, emails and all other details are collected only by your Google Form.
