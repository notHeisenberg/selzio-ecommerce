# ✅ Quick Deploy Checklist - Netlify

## 🚨 CRITICAL: Database Indexes

**You MUST create indexes on your production MongoDB before deploying!**

### Quick Method:

```bash
# 1. Update MONGODB_URI to production in a temporary file
cp .env.local .env.production

# 2. Edit .env.production and set production MongoDB URI
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/selzio_business

# 3. Run index script
MONGODB_URI=your_production_uri node scripts/add-db-indexes.js

# 4. Verify success (should see ✓ Created index messages)
```

---

## 📋 Deployment Steps

### 1. Create Production Indexes ⚠️ REQUIRED

```bash
node scripts/add-db-indexes.js
# (with production MONGODB_URI)
```

### 2. Set Netlify Environment Variables

Go to: **Netlify Dashboard → Site Settings → Environment Variables**

Add:
```
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://yoursite.netlify.app
```

### 3. Deploy

```bash
git add .
git commit -m "Add optimizations"
git push origin main
```

**Netlify auto-deploys from git!**

---

## ✅ Verify After Deploy

1. Open: `https://yoursite.netlify.app`
2. Check DevTools → Network
3. Verify:
   - `/api/homepage-data` < 200ms ✅
   - `/api/reviews/[code]` < 200ms ✅
   - No errors ✅

---

## 🔧 If Something Goes Wrong

### Slow API responses?
→ **Indexes not created!** Run the index script against production MongoDB

### MongoDB connection error?
→ Check **MongoDB Atlas → Network Access** (allow 0.0.0.0/0)

### 404 on API routes?
→ Check build logs, verify Netlify plugin is installed

### Environment variables not working?
→ Redeploy after setting variables in Netlify dashboard

---

## 🎯 Expected Performance

**With Indexes (Production):**
- Homepage: < 1-2 seconds
- API responses: < 100ms
- Lighthouse: > 85-90

**Without Indexes:**
- Homepage: 3-5 seconds
- API responses: 1-5 seconds
- ⚠️ **NOT RECOMMENDED!**

---

## 💡 Pro Tips

1. **Always create indexes first** before going live
2. **Test build locally** with `npm run build`
3. **Monitor performance** in Netlify Analytics
4. **Check MongoDB Atlas metrics** to verify indexes are used
5. **Clear Netlify cache** if issues persist (Site settings → Build & deploy → Clear cache)

---

## ✅ You're Good to Go!

Once indexes are created and variables are set, your site will be **70-90% faster** in production! 🚀

