# MedResearch-AI - FREE API Keys Setup Guide

**Project Context:** Systematic review automation requires access to medical literature databases. All APIs listed here are 100% FREE for academic/research use.

---

## 🔑 Step-by-Step API Key Configuration

### **Step 1: Semantic Scholar API (FREE - Instant)**

**What it does:** Access to 200M+ academic papers with citation data  
**Cost:** FREE forever  
**Rate limit:** 100 requests/second (very generous)

1. Visit: https://www.semanticscholar.org/product/api
2. Click **"Get API Key"** button
3. Sign up with your email (instant approval)
4. Copy your API key
5. Open `.env` file in MedResearch-AI folder
6. Add this line:
   ```
   SEMANTIC_SCHOLAR_API_KEY=your_key_here
   ```

**Example:**
```env
SEMANTIC_SCHOLAR_API_KEY=AbCdEf123456789XyZ
```

---

### **Step 2: The Lens API (FREE - 24-48 hour approval)**

**What it does:** Access to 240M+ scholarly works, patents, and research  
**Cost:** FREE for academic use  
**Rate limit:** 50 requests/minute

1. Visit: https://www.lens.org/lens/user/register
2. Create account with academic email (recommended)
3. Go to: https://www.lens.org/lens/user/subscriptions
4. Click **"Request Scholarly API Access"**
5. Fill form (select "Academic/Research" use)
6. Wait 24-48 hours for approval email
7. Once approved, copy your API token
8. Add to `.env`:
   ```
   LENS_API_KEY=your_token_here
   ```

**Example:**
```env
LENS_API_KEY=AbCdEf123456789XyZ-LensToken
```

---

### **Step 3: Unpaywall (FREE - Instant, No Signup)**

**What it does:** Find free, legal, full-text PDFs of research papers  
**Cost:** FREE forever  
**Rate limit:** 100,000 requests/day

1. No signup needed! Just use your email
2. Open `.env` file
3. Add this line with YOUR email:
   ```
   UNPAYWALL_EMAIL=your.email@domain.com
   ```

**Example:**
```env
UNPAYWALL_EMAIL=researcher@university.edu
```

---

### **Step 4: PubMed API Key (OPTIONAL - Already Works Without Key)**

**What it does:** Access to 35M+ biomedical citations (MEDLINE)  
**Cost:** FREE forever  
**Rate limit:** 3 req/sec without key, 10 req/sec with key

**Note:** PubMed already works without a key. Only get this if you need higher rate limits.

1. Visit: https://www.ncbi.nlm.nih.gov/account/register/
2. Create NCBI account
3. Go to: https://www.ncbi.nlm.nih.gov/account/settings/
4. Click **"API Key Management"**
5. Create new API key
6. Copy key and add to `.env`:
   ```
   PUBMED_API_KEY=your_key_here
   ```

**Example:**
```env
PUBMED_API_KEY=a1b2c3d4e5f6g7h8i9j0
```

---

### **Step 5: Zotero (OPTIONAL - For Reference Management)**

**What it does:** Reference management and bibliography generation  
**Cost:** FREE (300MB storage, unlimited for local)  
**Rate limit:** Very generous

1. Visit: https://www.zotero.org/user/register
2. Create free account
3. Go to: https://www.zotero.org/settings/keys
4. Click **"Create new private key"**
5. Give it a name (e.g., "MedResearch-AI")
6. Select permissions: **Allow library access** (read/write)
7. Click **"Save Key"**
8. Copy the key AND your user ID (shown at top of page)
9. Add to `.env`:
   ```
   ZOTERO_API_KEY=your_key_here
   ZOTERO_USER_ID=your_user_id_here
   ```

**Example:**
```env
ZOTERO_API_KEY=AbCdEf123456789XyZ
ZOTERO_USER_ID=1234567
```

---

## ✅ Verification Checklist

After adding keys to `.env`, verify your file looks like this:

```env
# =============================================================================
# MEDICAL DATABASE API KEYS (All FREE!)
# =============================================================================

# Semantic Scholar - FREE Academic API
SEMANTIC_SCHOLAR_API_KEY=your_actual_key_here

# The Lens - FREE for Academic Use
LENS_API_KEY=your_actual_token_here

# Unpaywall - FREE (just email)
UNPAYWALL_EMAIL=your.email@domain.com

# PubMed - OPTIONAL (already works without key)
PUBMED_API_KEY=your_key_if_you_want_higher_limits

# Zotero - OPTIONAL (for reference management)
ZOTERO_API_KEY=your_key_here
ZOTERO_USER_ID=your_user_id_here

# =============================================================================
# ALREADY WORKING (No keys needed)
# =============================================================================
# ✅ PubMed/MEDLINE - Works without key
# ✅ Europe PMC - Works without key
```

---

## 🧪 Test Your API Keys

After configuring, run the database test:

```bash
cd C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI
npm test -- tests/test-databases.js
```

**Expected result:**
- Before: 9/10 tests passing (The Lens failing)
- After: 10/10 tests passing ✅

---

## 🚨 Important Notes

### **Security Best Practices**
1. ✅ `.env` file is already in `.gitignore` (won't be committed to git)
2. ✅ Never share your API keys publicly
3. ✅ All these APIs are FREE - no credit card required
4. ✅ Keys can be regenerated if compromised

### **Rate Limits**
- **Semantic Scholar:** 100 req/sec (very generous)
- **The Lens:** 50 req/min (sufficient for research)
- **Unpaywall:** 100,000 req/day (more than enough)
- **PubMed:** 3 req/sec (10 with key)
- **Europe PMC:** 5 req/sec (no key needed)

### **Academic Use Only**
All these APIs are FREE for:
- ✅ Academic research
- ✅ Systematic reviews
- ✅ Meta-analyses
- ✅ Educational purposes
- ✅ Non-commercial projects

---

## 📞 Support

### **If You Have Issues:**

1. **Semantic Scholar not working?**
   - Check key is correct (no extra spaces)
   - Verify at: https://www.semanticscholar.org/product/api#api-key

2. **The Lens not approved yet?**
   - Usually takes 24-48 hours
   - Check spam folder for approval email
   - Can continue without it (other databases work)

3. **Unpaywall not working?**
   - Just needs a valid email format
   - No verification required

4. **Need help?**
   - Check test output for specific errors
   - All APIs have excellent documentation
   - MedResearch-AI has fallback mechanisms

---

## 🎯 Next Steps After Configuration

1. ✅ Add API keys to `.env` file
2. ✅ Run database tests: `npm test -- tests/test-databases.js`
3. ✅ Verify 10/10 tests passing
4. ✅ Move to Task 2: Tune plagiarism algorithm

---

**Generated:** December 13, 2025  
**Project:** MedResearch-AI v6.0.0-beta  
**Purpose:** Enable FREE access to medical literature databases
