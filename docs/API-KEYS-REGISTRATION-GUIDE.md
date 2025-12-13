# 🔑 Free API Keys Registration Guide

**MedResearch-AI - Real API Integration**  
**All APIs are 100% FREE - No costs ever!**  
**Total Registration Time: ~15 minutes**

---

## 📋 Quick Overview

| API | Required? | Time | Rate Limit | Benefit |
|-----|-----------|------|------------|---------|
| **PubMed** | Optional | 5 min | 3/sec → 10/sec | 3x faster |
| **Semantic Scholar** | Recommended | 5 min | 1/sec → 100/sec | 100x faster! 🚀 |
| **Europe PMC** | No | 0 min | 10/sec | Already works! |
| **Zotero** | Yes | 5 min | 10/sec | Reference management |

**Total: ~15 minutes for all keys** ⏱️

---

## 1️⃣ PubMed E-utilities API Key

### Benefits
- ✅ **FREE forever** - No costs, no subscriptions
- ✅ **3x faster** - 3 requests/sec → 10 requests/sec
- ✅ **33M+ articles** - Access to entire PubMed/MEDLINE database
- ✅ **Optional** - Works without key (just slower)

### Registration Steps

#### Step 1: Create NCBI Account (2 minutes)

1. **Go to:** https://www.ncbi.nlm.nih.gov/account/
2. **Click:** "Register for an NCBI account"
3. **Fill in:**
   ```
   Email: your_email@example.com
   Username: your_username
   Password: (create strong password)
   First Name: Your Name
   Last Name: Your Last Name
   ```
4. **Click:** "Register"
5. **Check email** and click verification link

#### Step 2: Get API Key (2 minutes)

1. **Log in** to your NCBI account
2. **Go to:** https://www.ncbi.nlm.nih.gov/account/settings/
3. **Scroll down** to "API Key Management" section
4. **Click:** "Create an API Key"
5. **Copy your key** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8`)

#### Step 3: Save to .env File

```bash
PUBMED_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8
PUBMED_EMAIL=your_email@example.com
```

✅ **Done! PubMed API key obtained**

---

## 2️⃣ Semantic Scholar API Key

### Benefits
- ✅ **FREE forever** - No costs, no subscriptions
- ✅ **100x faster** - 1 request/sec → 100 requests/sec 🚀
- ✅ **200M+ papers** - Massive academic database
- ✅ **Highly recommended** - Huge performance boost

### Registration Steps

#### Step 1: Request API Key (3 minutes)

1. **Go to:** https://www.semanticscholar.org/product/api
2. **Scroll down** to "Get API Key" section
3. **Click:** "Request API Key" button
4. **Fill in the form:**
   ```
   Name: Your Name
   Email: your_email@example.com
   Organization: Your University/Company (or "Personal Project")
   Use Case: "Systematic review and meta-analysis research tool"
   Expected Usage: "Academic research, literature search, citation analysis"
   ```
5. **Submit** the form

#### Step 2: Wait for Approval (1-24 hours)

- Check your email for API key
- Usually approved within **1-24 hours**
- Sometimes instant!

#### Step 3: Save to .env File

```bash
SEMANTIC_SCHOLAR_API_KEY=your_key_here
```

✅ **Done! Semantic Scholar API key obtained**

**Note:** You already have a Semantic Scholar key in your .env:
```
SEMANTIC_SCHOLAR_API_KEY=DK56EEYTvw6DysKouDxy75QzuQRNXZXJ7u0ZVlvg
```
This should work! Test it first before requesting a new one.

---

## 3️⃣ Europe PMC API

### Benefits
- ✅ **FREE forever** - No costs, no subscriptions
- ✅ **No registration needed** - Works immediately!
- ✅ **10 requests/sec** - Generous rate limit
- ✅ **40M+ publications** - Comprehensive database

### Registration Steps

**No steps needed!** ✅

Europe PMC is completely open. Your existing implementation already works.

---

## 4️⃣ Zotero API Key

### Benefits
- ✅ **FREE forever** - No costs, no subscriptions
- ✅ **Professional reference management** - Industry standard
- ✅ **Import/export** - Sync with Zotero library
- ✅ **Collaboration** - Share libraries with team

### Registration Steps

#### Step 1: Create Zotero Account (2 minutes)

1. **Go to:** https://www.zotero.org/user/register
2. **Fill in:**
   ```
   Username: your_username
   Email: your_email@example.com
   Password: (create strong password)
   ```
3. **Click:** "Register"
4. **Check email** and verify your account

#### Step 2: Get API Key (2 minutes)

1. **Log in** to Zotero
2. **Go to:** https://www.zotero.org/settings/keys
3. **Click:** "Create new private key"
4. **Configure permissions:**
   ```
   Key Description: MedResearch-AI Integration
   
   Personal Library:
   ✅ Allow library access
   
   Default Group Permissions:
   ⬜ None (unless you need group access)
   
   Specific Permissions:
   ✅ Allow library access: Read/Write
   ✅ Allow notes access: Read/Write
   ✅ Allow write access: Yes
   ```
5. **Click:** "Save Key"
6. **⚠️ IMPORTANT:** Copy your API key **immediately** (shown only once!)

#### Step 3: Get Your Library ID (1 minute)

1. **Still on:** https://www.zotero.org/settings/keys
2. **Look at top of page** - you'll see:
   ```
   Your userID for use in API calls is: 12345678
   ```
3. **Copy this number** (your Library ID)

#### Step 4: Save to .env File

```bash
ZOTERO_API_KEY=your_key_here
ZOTERO_LIBRARY_ID=12345678
ZOTERO_LIBRARY_TYPE=user
```

✅ **Done! Zotero API key obtained**

---

## 📝 Update Your .env File

### Option 1: Manual Update

1. **Open:** `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI\.env`
2. **Add these lines:**

```bash
# ========================================
# Real API Integration - FREE API Keys
# ========================================

# PubMed E-utilities (Optional - 3x faster)
PUBMED_API_KEY=your_pubmed_key_here
PUBMED_EMAIL=your_email@example.com

# Semantic Scholar (Recommended - 100x faster!)
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_key_here

# Europe PMC (No key needed - already works!)
# No configuration needed

# Zotero (Required for reference management)
ZOTERO_API_KEY=your_zotero_key_here
ZOTERO_LIBRARY_ID=12345678
ZOTERO_LIBRARY_TYPE=user
```

3. **Replace** `your_*_key_here` with your actual keys
4. **Save** the file

### Option 2: Use Template

1. **Open:** `.env.api-keys-template` (created for you)
2. **Fill in** your API keys
3. **Copy** the values to your `.env` file

---

## ✅ Verify Your API Keys

### Test PubMed API Key

```bash
# Test in browser (replace YOUR_KEY and YOUR_EMAIL):
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=diabetes&retmode=json&api_key=YOUR_KEY&tool=medresearch&email=YOUR_EMAIL
```

**Expected:** JSON response with search results

### Test Semantic Scholar API Key

```bash
# Test in browser (replace YOUR_KEY):
https://api.semanticscholar.org/graph/v1/paper/search?query=diabetes&limit=1&fields=title,authors&x-api-key=YOUR_KEY
```

**Expected:** JSON response with paper data

### Test Zotero API Key

```bash
# Test in browser (replace YOUR_LIBRARY_ID and YOUR_KEY):
https://api.zotero.org/users/YOUR_LIBRARY_ID/items?limit=1&key=YOUR_KEY
```

**Expected:** JSON response with library items (or empty array if library is empty)

---

## 🔒 Security Best Practices

### Protect Your API Keys

1. **Never commit .env to Git**
   ```bash
   # Already in .gitignore:
   .env
   .env.local
   .env.*.local
   ```

2. **Never share API keys publicly**
   - Don't post in GitHub issues
   - Don't share in screenshots
   - Don't include in documentation

3. **Rotate keys if exposed**
   - If you accidentally expose a key, regenerate it immediately
   - All APIs allow key regeneration

4. **Use environment variables**
   - Keep keys in `.env` file only
   - Never hardcode in source code

---

## 📊 Rate Limits Summary

| API | Without Key | With Key | Limit Type |
|-----|-------------|----------|------------|
| **PubMed** | 3/sec | 10/sec | Per IP |
| **Semantic Scholar** | 1/sec | 100/sec | Per API key |
| **Europe PMC** | 10/sec | 10/sec | Per IP |
| **Zotero** | N/A | 10/sec | Per API key |

### What Happens if You Exceed Rate Limits?

- **HTTP 429 Error** - "Too Many Requests"
- **Automatic retry** - MedResearch-AI will retry with exponential backoff
- **No penalties** - Just temporary slowdown
- **No costs** - Still 100% FREE

---

## 🚨 Troubleshooting

### PubMed API Key Not Working

**Problem:** Getting 400 or 403 errors

**Solutions:**
1. Verify email is included in request: `&email=your_email@example.com`
2. Verify tool name is included: `&tool=medresearch`
3. Check key is correct (no extra spaces)
4. Wait 5 minutes after creating key (propagation delay)

### Semantic Scholar API Key Not Working

**Problem:** Getting 401 Unauthorized

**Solutions:**
1. Check if key is approved (check email)
2. Verify key is included in header: `x-api-key: YOUR_KEY`
3. Try without key first (1/sec rate limit)
4. Contact support: api@semanticscholar.org

### Zotero API Key Not Working

**Problem:** Getting 403 Forbidden

**Solutions:**
1. Verify Library ID is correct
2. Check permissions are set to Read/Write
3. Verify key hasn't expired
4. Regenerate key if needed

### Europe PMC Not Working

**Problem:** Connection errors

**Solutions:**
1. Check internet connection
2. Verify URL: https://www.ebi.ac.uk/europepmc/webservices/rest/search
3. No API key needed - should work immediately
4. Check rate limit (10/sec)

---

## 📞 Support Resources

### Official Documentation

- **PubMed E-utilities:** https://www.ncbi.nlm.nih.gov/books/NBK25501/
- **Semantic Scholar API:** https://api.semanticscholar.org/api-docs/
- **Europe PMC API:** https://europepmc.org/RestfulWebService
- **Zotero API:** https://www.zotero.org/support/dev/web_api/v3/start

### Contact Support

- **PubMed:** https://support.ncbi.nlm.nih.gov/
- **Semantic Scholar:** api@semanticscholar.org
- **Europe PMC:** helpdesk@europepmc.org
- **Zotero:** https://forums.zotero.org/

---

## ✅ Registration Checklist

Use this checklist to track your progress:

### PubMed E-utilities
- [ ] Create NCBI account
- [ ] Verify email
- [ ] Generate API key
- [ ] Add to .env file
- [ ] Test API key

### Semantic Scholar
- [ ] Request API key
- [ ] Wait for approval email
- [ ] Add to .env file
- [ ] Test API key

### Europe PMC
- [x] No action needed - already works!

### Zotero
- [ ] Create Zotero account
- [ ] Verify email
- [ ] Generate API key
- [ ] Get Library ID
- [ ] Add to .env file
- [ ] Test API key

### Final Steps
- [ ] All keys added to .env
- [ ] All keys tested and working
- [ ] .env file backed up securely
- [ ] Ready to implement real API integration!

---

## 🎉 Next Steps

Once you have all your API keys:

1. **Review Implementation Plan**
   - Read: `API-INTEGRATION-RESEARCH-REPORT.md`
   - Read: `API-INTEGRATION-QUICK-REFERENCE.md`

2. **Start with PubMed** (1-2 days)
   - Implement ESearch, EFetch, ESummary
   - Add rate limiting
   - Write tests

3. **Enhance Semantic Scholar** (1 day)
   - Add API key support
   - Increase rate limit to 100/sec
   - Improve metadata extraction

4. **Implement Zotero** (3-4 days)
   - OAuth 2.0 flow
   - Import/export functionality
   - Library synchronization

5. **Polish & Test** (2-3 days)
   - Integration tests
   - Documentation
   - Security audit

**Total: 2-3 weeks to production-ready real API integration!** 🚀

---

**Document Version:** 1.0  
**Last Updated:** December 13, 2025  
**Status:** Ready to Use  

**All APIs are 100% FREE - No costs ever!** ✅
