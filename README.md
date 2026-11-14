# GitHub Contribution Bomber

Turn your boring 2D GitHub contribution graph into a **cinematic 3D bombing run** that updates automatically every day! 

![Contribution Bomber](out.gif)

This project uses React Three Fiber and Remotion to fetch your real GitHub contribution data and render it into a jaw-dropping, high-resolution 3D animation that fits perfectly as a banner on your GitHub profile. 

---

## 🛠️ How to get this on YOUR GitHub Profile

I made this fully automated so anyone can use it in 60 seconds without writing a single line of code!

### Step 1: Fork this repo
1. Click the **Fork** button in the top right corner of this page to copy this repository into your own GitHub account.

### Step 2: Enable GitHub Actions
1. Go to your new forked repository.
2. Click on the **Actions** tab at the top.
3. You will see a message saying "Workflows aren't being run on this forked repository". Click the big green button that says **I understand my workflows, go ahead and enable them**.

### Step 3: Run the Bomber
1. On the left sidebar under "Workflows", click on **Render Contribution Bomber**.
2. On the right side, click the **Run workflow** dropdown, and click the green **Run workflow** button.
3. Wait about 3 minutes for the yellow circle to turn into a green checkmark! 

*(This cloud server is now automatically downloading your personal GitHub contributions, generating your custom 3D animation, and saving it to your repo!)*

### Step 4: Add it to your Profile!
Once the workflow finishes, the server will automatically create a file in your repository called **`USAGE.md`**.

1. Go back to the **Code** tab of your repository.
2. Open the newly created `USAGE.md` file.
3. Inside, you will find the **exact copy-and-paste code** for your personal image. 
4. Paste that code anywhere inside your main GitHub Profile README (`username/username`).

**That's it!** Because of the built-in automation, this GitHub Action will wake up every day at midnight and re-render your 3D animation so it stays perfectly synced with your latest contributions!

---

## 💻 Tech Stack
* **React** & **TypeScript**
* **Three.js** & **React Three Fiber** for the 3D graphics
* **Remotion** for the headless server-side video rendering
* **GitHub Actions** for the daily CI/CD pipeline

---
*Created by [Dhruv-mavani](https://github.com/Dhruv-mavani)*
