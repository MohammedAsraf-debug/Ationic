(function () {
  'use strict';

  var CATEGORIES = [
    { slug: 'digital-marketing', label: 'Digital Marketing' },
    { slug: 'seo', label: 'SEO' },
    { slug: 'google-ads', label: 'Google Ads' },
    { slug: 'meta-ads', label: 'Meta Ads' },
    { slug: 'web-development', label: 'Web Development' },
    { slug: 'lead-generation', label: 'Lead Generation' },
    { slug: 'case-studies', label: 'Case Studies' },
    { slug: 'guides', label: 'Guides' },
    { slug: 'agency-news', label: 'Agency News' }
  ];

  var PAGE_SIZE = 20;

  var state = {
    username: '',
    csrf: '',
    posts: [],
    filtered: [],
    page: 1,
    totalPages: 1,
    search: '',
    statusFilter: '',
    listStale: true,
    slugTouched: false,
    dirty: false,
    busy: {
      login: false,
      save: false,
      uploadCover: false,
      uploadInline: false,
      toggle: {},
      remove: false,
      preview: false,
      logout: false
    },
    savedRange: null,
    confirmResolver: null,
    confirmTrigger: null
  };

  var el = {};

  function qs(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(input) {
    return String(input || '')
      .toLowerCase()
      .replace(/['\u2019]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/g, '');
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '\u2014';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function showToast(message, isError) {
    el.toast.textContent = message;
    el.toast.classList.toggle('err', !!isError);
    el.toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { el.toast.classList.remove('show'); }, 3500);
  }

  function ApiError(status, message) {
    this.status = status;
    this.message = message;
  }

  function api(path, options) {
    options = options || {};
    var opts = {
      method: options.method || 'GET',
      credentials: 'same-origin',
      headers: Object.assign({}, options.headers || {})
    };
    if (state.csrf && opts.method !== 'GET') opts.headers['X-CSRF-Token'] = state.csrf;
    if (options.json !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(options.json);
    } else if (options.rawBody !== undefined) {
      opts.body = options.rawBody;
    }
    return fetch('/api/admin/' + path, opts).then(function (res) {
      var ct = res.headers.get('content-type') || '';
      var parse = ct.indexOf('json') !== -1 ? res.json() : res.text().then(function (t) { return t ? JSON.parse(t) : {}; });
      return parse.then(function (data) {
        if (!res.ok) {
          if (res.status === 401 && path !== 'login' && path !== 'me') sessionExpired();
          throw new ApiError(res.status, (data && data.error) || ('Request failed (' + res.status + ')'));
        }
        return data;
      });
    }, function () {
      throw new ApiError(0, 'Network error. Please check your connection.');
    });
  }

  function sessionExpired() {
    state.csrf = '';
    state.username = '';
    showToast('Session expired. Please sign in again.', true);
    showLogin();
  }

  function setBusy(name, flag, btnRef, busyLabel) {
    state.busy[name] = flag;
    if (btnRef) {
      btnRef.disabled = flag;
      if (flag && busyLabel) {
        if (!btnRef._origLabel) btnRef._origLabel = btnRef.innerHTML;
        btnRef.innerHTML = busyLabel;
      } else if (btnRef._origLabel) {
        btnRef.innerHTML = btnRef._origLabel;
      }
    }
  }

  function isBusy(name) { return !!state.busy[name]; }

  function showLogin(configError) {
    el.viewDashboard.hidden = true;
    el.viewEditor.hidden = true;
    var host = qs('loginHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'loginHost';
      el.shell.insertBefore(host, el.viewDashboard);
    }
    host.innerHTML =
      '<div class="login-wrap">' +
      '<form class="login-card" id="loginForm" novalidate>' +
      '<h1><i class="fas fa-lock" aria-hidden="true"></i> Blog Admin</h1>' +
      '<p class="hint" style="color:var(--a-muted);font-size:.85rem;margin-bottom:18px">Sign in to manage the Ationic blog.</p>' +
      '<div class="field">' +
      '<label for="l-user">Username</label>' +
      '<input type="text" id="l-user" autocomplete="username" required>' +
      '</div>' +
      '<div class="field">' +
      '<label for="l-pass">Password</label>' +
      '<input type="password" id="l-pass" autocomplete="current-password" required>' +
      '</div>' +
      '<div class="alert ' + (configError ? '' : 'alert-error') + '" id="loginError" ' + ((configError || '') === '' && !configError ? 'hidden' : '') + '></div>' +
      '<button type="submit" class="btn" id="loginBtn" style="width:100%;margin-top:6px"><i class="fas fa-right-to-bracket"></i> Sign in</button>' +
      '</form>' +
      '</div>';
    var errBox = qs('loginError');
    if (configError) { errBox.textContent = configError; errBox.classList.add('alert-error'); }
    else errBox.hidden = true;
    qs('loginForm').addEventListener('submit', onLoginSubmit);
    setTimeout(function () { qs('l-user').focus(); }, 30);
  }

  function destroyLogin() {
    var host = qs('loginHost');
    if (host) host.remove();
  }

  function onLoginSubmit(e) {
    e.preventDefault();
    if (isBusy('login')) return;
    var userEl = qs('l-user');
    var passEl = qs('l-pass');
    var errBox = qs('loginError');
    var user = userEl.value.trim();
    var pass = passEl.value;
    errBox.hidden = true;
    if (!user || !pass) {
      errBox.textContent = 'Please enter your username and password.';
      errBox.hidden = false;
      return;
    }
    var btn = qs('loginBtn');
    setBusy('login', true, btn, 'Signing in\u2026');
    api('login', { method: 'POST', json: { username: user, password: pass } }).then(function (data) {
      state.csrf = data.csrfToken || '';
      passEl.value = '';
      return enterDashboard();
    }, function (err) {
      errBox.textContent = err.status === 429
        ? 'Too many failed attempts. Try again in 15 minutes.'
        : (err.message || 'Sign-in failed.');
      errBox.hidden = false;
      passEl.value = '';
      passEl.focus();
    }).finally(function () {
      setBusy('login', false, btn);
    });
  }

  function enterDashboard() {
    return api('me').then(function (data) {
      state.username = data.username || 'admin';
      if (data.csrfFromCookie && !state.csrf) state.csrf = data.csrfFromCookie;
      destroyLogin();
      el.whoami.textContent = 'Signed in as ' + state.username;
      el.viewDashboard.hidden = false;
      el.viewEditor.hidden = true;
      return refreshPosts(true);
    });
  }

  function refreshPosts(force) {
    if (!force && !state.listStale) { renderDashboard(); return Promise.resolve(); }
    el.emptyMsg.hidden = true;
    el.postsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--a-muted)">Loading\u2026</td></tr>';
    return fetchAllPosts().then(function (posts) {
      state.posts = posts;
      state.listStale = false;
      renderDashboard();
    }, function (err) {
      el.postsTbody.innerHTML = '';
      el.emptyMsg.hidden = false;
      el.emptyMsg.textContent = err.message || 'Could not load posts.';
      showToast(err.message || 'Could not load posts.', true);
    });
  }

  function fetchAllPosts() {
    var collected = [];
    function nextPage(page) {
      return api('posts?page=' + page + '&perPage=' + PAGE_SIZE).then(function (data) {
        collected = collected.concat(data.items || []);
        if (collected.length < data.total && page < data.totalPages && page < 100) return nextPage(page + 1);
        return collected;
      });
    }
    return nextPage(1);
  }

  function applyFilters() {
    var q = state.search.trim().toLowerCase();
    state.filtered = state.posts.filter(function (p) {
      if (state.statusFilter && p.status !== state.statusFilter) return false;
      if (!q) return true;
      return p.title.toLowerCase().indexOf(q) !== -1 || p.slug.indexOf(q) !== -1;
    });
    state.totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
    if (state.page > state.totalPages) state.page = state.totalPages;
  }

  function renderDashboard() {
    var total = state.posts.length;
    var published = state.posts.filter(function (p) { return p.status === 'published'; }).length;
    var drafts = total - published;
    el.statsRow.innerHTML =
      statBox('Total Posts', total) +
      statBox('Published', published) +
      statBox('Drafts', drafts);
    applyFilters();
    var slice = state.filtered.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
    if (!slice.length) {
      el.postsTbody.innerHTML = '';
      el.emptyMsg.hidden = false;
      el.emptyMsg.textContent = state.posts.length === 0
        ? 'No posts found. Click \u201CNew Post\u201D to write your first article.'
        : 'No posts match your search or filter.';
    } else {
      el.emptyMsg.hidden = true;
      el.postsTbody.innerHTML = slice.map(rowHtml).join('');
    }
    renderPager();
  }

  function statBox(label, value) {
    return '<div class="stat-box"><span class="stat-value">' + value + '</span><span class="stat-label">' + label + '</span></div>';
  }

  function rowHtml(p) {
    var viewCell = p.status === 'published'
      ? '<a class="post-title-cell" href="/blog/' + encodeURIComponent(p.slug) + '/" target="_blank" rel="noopener">' + escapeHtml(p.title) + '</a>'
      : '<span class="post-title-cell">' + escapeHtml(p.title) + '</span>';
    return '<tr data-slug="' + escapeHtml(p.slug) + '">' +
      '<td>' + viewCell + '<div style="color:var(--a-muted);font-size:.75rem">/' + escapeHtml(p.slug) + '/</div></td>' +
      '<td><span class="badge badge-' + p.status + '">' + p.status + '</span></td>' +
      '<td>' + escapeHtml(p.categoryLabel || p.category || '\u2014') + '</td>' +
      '<td style="white-space:nowrap">' + formatDate(p.updatedAt || p.createdAt) + '</td>' +
      '<td style="text-align:right;white-space:nowrap"><span class="row-actions">' +
      '<button type="button" class="icon-btn" data-act="edit"><i class="fas fa-pen"></i> Edit</button>' +
      '<button type="button" class="icon-btn" data-act="preview"><i class="fas fa-eye"></i> Preview</button>' +
      '<button type="button" class="icon-btn" data-act="toggle"><i class="fas fa-' + (p.status === 'published' ? 'arrow-down' : 'arrow-up') + '"></i> ' + (p.status === 'published' ? 'Unpublish' : 'Publish') + '</button>' +
      '<button type="button" class="icon-btn btn-danger" data-act="delete"><i class="fas fa-trash"></i></button>' +
      '</span></td></tr>';
  }

  function renderPager() {
    if (state.totalPages <= 1) { el.pager.innerHTML = ''; return; }
    var html = '';
    var i;
    for (i = 1; i <= state.totalPages; i++) {
      html += '<button type="button" class="icon-btn' + (i === state.page ? ' pager-current' : '') + '" data-page="' + i + '"' + (i === state.page ? ' aria-current="page"' : '') + '>' + i + '</button>';
    }
    el.pager.innerHTML = html;
  }

  function onTableClick(e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    var tr = e.target.closest('tr[data-slug]');
    if (!tr) return;
    var slug = tr.getAttribute('data-slug');
    var act = btn.getAttribute('data-act');
    if (act === 'edit') openEditorFor(slug);
    else if (act === 'preview') runPreview(slug, btn);
    else if (act === 'toggle') togglePublish(slug, btn);
    else if (act === 'delete') removePost(slug, btn);
  }

  function findPost(slug) {
    for (var i = 0; i < state.posts.length; i++) {
      if (state.posts[i].slug === slug) return state.posts[i];
    }
    return null;
  }

  function replacePost(updated) {
    for (var i = 0; i < state.posts.length; i++) {
      if (state.posts[i].slug === updated.slug || state.posts[i].slug === updated._previousSlug) {
        state.posts[i] = updated;
        return;
      }
    }
    state.posts.unshift(updated);
  }

  function openEditorFor(slug) {
    api('posts/' + encodeURIComponent(slug)).then(function (data) {
      fillEditor(data.post);
    }, function (err) {
      showToast(err.message || 'Could not open post.', true);
    });
  }

  function openNewPost() {
    fillEditor(null);
  }

  function fillEditor(post) {
    destroyLogin();
    el.viewDashboard.hidden = true;
    el.viewEditor.hidden = false;
    window.scrollTo(0, 0);
    state.slugTouched = !!post;
    state.dirty = false;
    el.fOriginalSlug.value = post ? post.slug : '';
    el.fTitle.value = post ? post.title : '';
    el.fSlug.value = post ? post.slug : '';
    el.slugHint.textContent = post ? '/blog/' + post.slug + '/' : '';
    el.rteEditor.innerHTML = post ? (post.bodyHtml || '') : '';
    el.rteSource.value = '';
    el.rteWrap.classList.remove('mode-src');
    el.fExcerpt.value = post ? (post.excerpt || '') : '';
    el.fStatus.value = post ? post.status : 'draft';
    el.fCategory.value = post && post.category ? post.category : '';
    el.fTags.value = post && post.tags ? post.tags.join(', ') : '';
    el.fAuthor.value = post && post.author ? post.author : 'Ationic Team';
    el.fSeoTitle.value = post && post.seo && post.seo.title ? post.seo.title : '';
    el.fSeoDesc.value = post && post.seo && post.seo.description ? post.seo.description : '';
    el.fNoindex.checked = !!(post && post.seo && post.seo.noindex);
    el.fCoverUrl.value = post && post.coverImage ? post.coverImage : '';
    el.fCoverAlt.value = post && post.coverAlt ? post.coverAlt : '';
    if (post && post.coverImage) {
      el.coverPreview.src = post.coverImage;
      el.coverPreview.style.display = 'block';
    } else {
      el.coverPreview.removeAttribute('src');
      el.coverPreview.style.display = 'none';
    }
    updateCounters();
    updateTimestamps(post);
    el.editorStatus.textContent = post ? 'Editing \u201C' + post.title + '\u201D' : 'New post';
    el.previewBtn.disabled = !post;
    el.deleteBtn.hidden = !post;
    el.saveBtn.disabled = false;
    el.saveBtn.innerHTML = el.saveBtn._origLabel || el.saveBtn.innerHTML;
    el.fTitle.focus();
  }

  function updateTimestamps(post) {
    if (!post) { el.timestamps.textContent = 'Not saved yet.'; return; }
    el.timestamps.textContent =
      'Created ' + formatDate(post.createdAt) +
      ' \u00B7 Updated ' + formatDate(post.updatedAt || post.createdAt) +
      (post.publishedAt ? ' \u00B7 Published ' + formatDate(post.publishedAt) : '');
  }

  function updateCounters() {
    el.titleCount.textContent = el.fTitle.value.length + ' / 120';
    el.seoTitleCount.textContent = el.fSeoTitle.value.length + ' / 60 recommended';
    el.seoDescCount.textContent = el.fSeoDesc.value.length + ' / 160 recommended';
  }

  function markDirty() {
    state.dirty = true;
    if (el.fOriginalSlug.value) el.previewBtn.disabled = true;
    el.editorStatus.textContent = 'Unsaved changes';
  }

  function currentBodyHtml() {
    if (el.rteWrap.classList.contains('mode-src')) {
      return el.rteSource.value;
    }
    return el.rteEditor.innerHTML;
  }

  function collectPayload(existing) {
    var tags = el.fTags.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean).slice(0, 10);
    return {
      title: el.fTitle.value.trim(),
      slug: el.fSlug.value.trim(),
      excerpt: el.fExcerpt.value.trim(),
      bodyHtml: currentBodyHtml(),
      status: el.fStatus.value === 'published' ? 'published' : 'draft',
      category: el.fCategory.value || '',
      tags: tags,
      author: el.fAuthor.value.trim() || 'Ationic Team',
      coverImage: el.fCoverUrl.value.trim() || null,
      coverAlt: el.fCoverAlt.value.trim(),
      seo: {
        title: el.fSeoTitle.value.trim(),
        description: el.fSeoDesc.value.trim(),
        noindex: el.fNoindex.checked
      }
    };
  }

  function onSaveSubmit(e) {
    e.preventDefault();
    if (isBusy('save')) return;
    var payload = collectPayload();
    if (!payload.title) { showToast('Title is required.', true); el.fTitle.focus(); return; }
    if (!payload.bodyHtml.replace(/<[^>]*>/g, '').trim() && payload.bodyHtml.indexOf('<img') === -1) {
      showToast('Post body cannot be empty.', true);
      el.rteEditor.focus();
      return;
    }
    var isEdit = !!el.fOriginalSlug.value;
    var req = isEdit
      ? api('posts/' + encodeURIComponent(el.fOriginalSlug.value), { method: 'PUT', json: payload })
      : api('posts', { method: 'POST', json: payload });
    setBusy('save', true, el.saveBtn, '<i class="fas fa-spinner fa-spin"></i> Saving\u2026');
    el.editorStatus.textContent = 'Saving\u2026';
    req.then(function (data) {
      var post = data.post;
      post._previousSlug = isEdit ? el.fOriginalSlug.value : null;
      replacePost(post);
      state.listStale = true;
      state.dirty = false;
      el.fOriginalSlug.value = post.slug;
      if (!state.slugTouched) el.fSlug.value = post.slug;
      el.slugHint.textContent = '/blog/' + post.slug + '/';
      el.previewBtn.disabled = false;
      el.deleteBtn.hidden = false;
      updateTimestamps(post);
      el.editorStatus.textContent = 'Saved at ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      showToast(isEdit ? 'Changes saved.' : 'Post created' + (post.status === 'published' ? ' and published' : ' as draft') + '.');
    }, function (err) {
      el.editorStatus.textContent = '';
      showToast(err.message || 'Save failed.', true);
    }).finally(function () {
      setBusy('save', false, el.saveBtn);
    });
  }

  function togglePublish(slug, btn) {
    if (state.busy.toggle[slug]) return;
    state.busy.toggle[slug] = true;
    btn.disabled = true;
    api('posts/' + encodeURIComponent(slug)).then(function (data) {
      var post = data.post;
      post.status = post.status === 'published' ? 'draft' : 'published';
      var method = 'PUT';
      var url = 'posts/' + encodeURIComponent(slug);
      return api(url, { method: method, json: post }).then(function (res) {
        var updated = res.post;
        updated._previousSlug = slug;
        replacePost(updated);
        state.listStale = true;
        renderDashboard();
        showToast(updated.status === 'published' ? 'Post published.' : 'Post unpublished.');
      });
    }, function (err) {
      btn.disabled = false;
      showToast(err.message || 'Status change failed.', true);
    }).finally(function () {
      state.busy.toggle[slug] = false;
    });
  }

  function removePost(slug, btn) {
    if (state.busy.remove) return;
    openConfirm('Delete post?', 'This will permanently delete \u201C' + (findPost(slug) || {}).title + '\u201D and cannot be undone.').then(function (ok) {
      if (!ok) return;
      state.busy.remove = true;
      if (btn) btn.disabled = true;
      api('posts/' + encodeURIComponent(slug), { method: 'DELETE' }).then(function () {
        state.posts = state.posts.filter(function (p) { return p.slug !== slug; });
        state.listStale = true;
        if (el.fOriginalSlug.value === slug) goBackToList();
        else renderDashboard();
        showToast('Post deleted.');
      }, function (err) {
        if (btn) btn.disabled = false;
        showToast(err.message || 'Delete failed.', true);
      }).finally(function () {
        state.busy.remove = false;
      });
    });
  }

  function runPreview(slug, btn) {
    var target = slug || el.fOriginalSlug.value;
    if (!target) { showToast('Save the post before previewing.', true); return; }
    if (isBusy('preview')) return;
    setBusy('preview', true, btn || el.previewBtn, '<i class="fas fa-spinner fa-spin"></i>');
    api('preview-token/' + encodeURIComponent(target)).then(function (data) {
      window.open(data.url, '_blank', 'noopener');
    }, function (err) {
      showToast(err.message || 'Preview failed.', true);
    }).finally(function () {
      setBusy('preview', false, btn || el.previewBtn);
    });
  }

  function goBackToList() {
    el.viewEditor.hidden = true;
    el.viewDashboard.hidden = false;
    state.dirty = false;
    refreshPosts(state.listStale);
  }

  function onLogoutClick() {
    if (isBusy('logout')) return;
    setBusy('logout', true, el.logoutBtn, '<i class="fas fa-spinner fa-spin"></i>');
    api('logout', { method: 'POST', json: {} }).catch(function () {}).then(function () {
      state.csrf = '';
      state.username = '';
      state.posts = [];
      state.listStale = true;
      el.whoami.textContent = '';
      el.logoutBtn.innerHTML = el.logoutBtn._origLabel || el.logoutBtn.innerHTML;
      el.logoutBtn.disabled = false;
      state.busy.logout = false;
      showLogin();
    });
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result);
        var comma = result.indexOf(',');
        resolve(comma === -1 ? result : result.slice(comma + 1));
      };
      reader.onerror = function () { reject(new ApiError(0, 'Could not read file.')); };
      reader.readAsDataURL(file);
    });
  }

  function validateImageFile(file) {
    if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.type)) {
      return 'Only PNG, JPEG, GIF, or WebP images are allowed.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Image exceeds the 5 MB limit.';
    }
    if (file.size === 0) {
      return 'The selected file is empty.';
    }
    return null;
  }

  function uploadImage(file, btn, busyLabel) {
    return validateAndUpload(file, btn, busyLabel);
  }

  function validateAndUpload(file, btn, busyLabel) {
    var problem = validateImageFile(file);
    if (problem) return Promise.reject(new ApiError(400, problem));
    return readFileAsBase64(file).then(function (b64) {
      return api('upload', {
        method: 'POST',
        rawBody: b64,
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': encodeURIComponent(file.name)
        }
      });
    });
  }

  function onCoverUpload() {
    if (isBusy('uploadCover')) return;
    el.coverFileInput.value = '';
    el.coverFileInput.click();
  }

  function onCoverFileChosen() {
    var file = el.coverFileInput.files && el.coverFileInput.files[0];
    if (!file) return;
    var name = 'uploadCover';
    setBusy(name, true, el.coverUploadBtn, '<i class="fas fa-spinner fa-spin"></i> Uploading\u2026');
    uploadImage(file).then(function (data) {
      el.fCoverUrl.value = data.file.url;
      el.coverPreview.src = data.file.url;
      el.coverPreview.style.display = 'block';
      markDirty();
      showToast('Cover image uploaded.');
    }, function (err) {
      showToast(err.message || 'Upload failed.', true);
    }).finally(function () {
      setBusy(name, false, el.coverUploadBtn);
    });
  }

  function saveSelection() {
    var sel = window.getSelection();
    if (sel.rangeCount > 0 && el.rteEditor.contains(sel.anchorNode)) {
      state.savedRange = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    var sel = window.getSelection();
    sel.removeAllRanges();
    if (state.savedRange) {
      sel.addRange(state.savedRange);
    } else {
      var range = document.createRange();
      range.selectNodeContents(el.rteEditor);
      range.collapse(false);
      sel.addRange(range);
    }
  }

  function onInlineFileChosen() {
    var file = el.imgFileInput.files && el.imgFileInput.files[0];
    el.imgFileInput.value = '';
    if (!file) return;
    if (isBusy('uploadInline')) return;
    setBusy('uploadInline', true, null);
    el.editorStatus.textContent = 'Uploading image\u2026';
    uploadImage(file).then(function (data) {
      restoreSelection();
      el.rteEditor.focus();
      var alt = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
      document.execCommand('insertHTML', false, '<img src="' + encodeURI(data.file.url) + '" alt="' + escapeHtml(alt) + '" loading="lazy">');
      markDirty();
      el.editorStatus.textContent = 'Unsaved changes';
      showToast('Image inserted.');
    }, function (err) {
      showToast(err.message || 'Image upload failed.', true);
      el.editorStatus.textContent = state.dirty ? 'Unsaved changes' : '';
    }).finally(function () {
      setBusy('uploadInline', false, null);
    });
  }

  function onToolbarClick(e) {
    var btn = e.target.closest('button');
    if (!btn || !el.rteWrap.contains(btn)) return;
    e.preventDefault();
    if (btn.id === 'linkBtn') { insertLink(); return; }
    if (btn.id === 'srcToggle') { toggleSourceMode(); return; }
    var cmd = btn.getAttribute('data-cmd');
    var block = btn.getAttribute('data-block');
    el.rteEditor.focus();
    if (cmd === 'formatBlock' && btn.getAttribute('data-value')) {
      document.execCommand('formatBlock', false, btn.getAttribute('data-value'));
    } else if (cmd) {
      document.execCommand(cmd, false, null);
    } else if (block) {
      document.execCommand('formatBlock', false, block);
    }
    markDirty();
  }

  function insertLink() {
    var url = window.prompt('Link URL (https://, mailto:, or /relative/path):');
    if (url === null) return;
    url = String(url).trim();
    if (!url) return;
    if (!/^(https?:\/\/|mailto:|#|\/)/i.test(url)) {
      showToast('Invalid link URL. Use https://, mailto:, #, or a relative path.', true);
      return;
    }
    el.rteEditor.focus();
    restoreSelection();
    var sel = window.getSelection();
    if (sel.isCollapsed) {
      document.execCommand('insertHTML', false, '<a href="' + escapeHtml(url) + '">' + escapeHtml(url) + '</a>');
    } else {
      document.execCommand('createLink', false, url);
    }
    markDirty();
  }

  function toggleSourceMode() {
    var entering = !el.rteWrap.classList.contains('mode-src');
    if (entering) {
      el.rteSource.value = el.rteEditor.innerHTML;
      el.rteWrap.classList.add('mode-src');
      el.rteSource.focus();
    } else {
      el.rteEditor.innerHTML = el.rteSource.value;
      el.rteWrap.classList.remove('mode-src');
    }
    markDirty();
  }

  function onTitleInput() {
    updateCounters();
    if (!state.slugTouched) {
      el.fSlug.value = slugify(el.fTitle.value);
    }
    markDirty();
  }

  function onSlugInput() {
    state.slugTouched = true;
    var cleaned = slugify(el.fSlug.value);
    if (cleaned !== el.fSlug.value) el.fSlug.value = cleaned;
    el.slugHint.textContent = cleaned ? '/blog/' + cleaned + '/' : '';
    markDirty();
  }

  function openConfirm(title, text) {
    el.confirmTitle.textContent = title;
    el.confirmText.textContent = text;
    el.confirmModal.classList.add('open');
    state.confirmTrigger = document.activeElement;
    el.confirmOk.focus();
    return new Promise(function (resolve) {
      state.confirmResolver = resolve;
    });
  }

  function settleConfirm(result) {
    el.confirmModal.classList.remove('open');
    if (state.confirmResolver) {
      state.confirmResolver(result);
      state.confirmResolver = null;
    }
    if (state.confirmTrigger && state.confirmTrigger.focus) state.confirmTrigger.focus();
    state.confirmTrigger = null;
  }

  function onModalKeydown(e) {
    if (e.key === 'Escape' && el.confirmModal.classList.contains('open')) {
      settleConfirm(false);
    }
  }

  function populateCategories() {
    var html = '<option value="">\u2014 None \u2014</option>';
    for (var i = 0; i < CATEGORIES.length; i++) {
      html += '<option value="' + CATEGORIES[i].slug + '">' + escapeHtml(CATEGORIES[i].label) + '</option>';
    }
    el.fCategory.innerHTML = html;
  }

  function cacheDom() {
    el.shell = document.querySelector('.admin-shell');
    el.whoami = qs('whoami');
    el.logoutBtn = qs('logoutBtn');
    el.viewDashboard = qs('view-dashboard');
    el.viewEditor = qs('view-editor');
    el.statsRow = qs('statsRow');
    el.searchInput = qs('searchInput');
    el.statusFilter = qs('statusFilter');
    el.newPostBtn = qs('newPostBtn');
    el.postsTbody = qs('postsTbody');
    el.emptyMsg = qs('emptyMsg');
    el.pager = qs('pager');
    el.backBtn = qs('backBtn');
    el.editorStatus = qs('editorStatus');
    el.editorForm = qs('editorForm');
    el.fOriginalSlug = qs('f-originalSlug');
    el.fTitle = qs('f-title');
    el.titleCount = qs('titleCount');
    el.fSlug = qs('f-slug');
    el.slugHint = qs('slugHint');
    el.rteWrap = qs('rteWrap');
    el.rteToolbar = el.rteWrap.querySelector('.rte-toolbar');
    el.rteEditor = qs('rteEditor');
    el.rteSource = qs('rteSource');
    el.imgFileInput = qs('imgFileInput');
    el.fStatus = qs('f-status');
    el.timestamps = qs('timestamps');
    el.saveBtn = qs('saveBtn');
    el.previewBtn = qs('previewBtn');
    el.deleteBtn = qs('deleteBtn');
    el.fCategory = qs('f-category');
    el.fTags = qs('f-tags');
    el.fAuthor = qs('f-author');
    el.fCoverUrl = qs('f-coverUrl');
    el.coverUploadBtn = qs('coverUploadBtn');
    el.coverFileInput = qs('coverFileInput');
    el.coverPreview = qs('coverPreview');
    el.fCoverAlt = qs('f-coverAlt');
    el.fSeoTitle = qs('f-seoTitle');
    el.seoTitleCount = qs('seoTitleCount');
    el.fSeoDesc = qs('f-seoDesc');
    el.seoDescCount = qs('seoDescCount');
    el.fNoindex = qs('f-noindex');
    el.fExcerpt = qs('f-excerpt');
    el.confirmModal = qs('confirmModal');
    el.confirmTitle = qs('confirmTitle');
    el.confirmText = qs('confirmText');
    el.confirmCancel = qs('confirmCancel');
    el.confirmOk = qs('confirmOk');
    el.toast = qs('toast');
  }

  function wireEvents() {
    el.logoutBtn.addEventListener('click', onLogoutClick);
    el.newPostBtn.addEventListener('click', openNewPost);
    el.backBtn.addEventListener('click', goBackToList);
    el.postsTbody.addEventListener('click', onTableClick);
    el.pager.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-page]');
      if (!btn) return;
      state.page = parseInt(btn.getAttribute('data-page'), 10) || 1;
      renderDashboard();
    });

    var searchTimer = null;
    el.searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.search = el.searchInput.value;
        state.page = 1;
        renderDashboard();
      }, 200);
    });
    el.statusFilter.addEventListener('change', function () {
      state.statusFilter = el.statusFilter.value;
      state.page = 1;
      renderDashboard();
    });

    el.editorForm.addEventListener('submit', onSaveSubmit);
    el.fTitle.addEventListener('input', onTitleInput);
    el.fSlug.addEventListener('input', onSlugInput);
    el.fSeoTitle.addEventListener('input', updateCounters);
    el.fSeoDesc.addEventListener('input', updateCounters);
    el.fStatus.addEventListener('change', markDirty);
    el.fCategory.addEventListener('change', markDirty);
    el.fTags.addEventListener('input', markDirty);
    el.fAuthor.addEventListener('input', markDirty);
    el.fCoverAlt.addEventListener('input', markDirty);
    el.fSeoTitle.addEventListener('input', markDirty);
    el.fSeoDesc.addEventListener('input', markDirty);
    el.fNoindex.addEventListener('change', markDirty);
    el.fExcerpt.addEventListener('input', markDirty);

    el.previewBtn.addEventListener('click', function () { runPreview(null, el.previewBtn); });
    el.deleteBtn.addEventListener('click', function () {
      if (el.fOriginalSlug.value) removePost(el.fOriginalSlug.value, el.deleteBtn);
    });

    el.rteToolbar.addEventListener('mousedown', function (e) {
      if (e.target.closest('button')) e.preventDefault();
    });
    el.rteToolbar.addEventListener('click', onToolbarClick);
    el.rteEditor.addEventListener('input', markDirty);
    el.rteSource.addEventListener('input', markDirty);
    el.rteEditor.addEventListener('keyup', saveSelection);
    el.rteEditor.addEventListener('mouseup', saveSelection);
    el.imgFileInput.addEventListener('change', onInlineFileChosen);
    el.rteToolbar.querySelector('.upload-label').addEventListener('click', saveSelection);

    el.coverUploadBtn.addEventListener('click', onCoverUpload);
    el.coverFileInput.addEventListener('change', onCoverFileChosen);

    el.confirmCancel.addEventListener('click', function () { settleConfirm(false); });
    el.confirmOk.addEventListener('click', function () { settleConfirm(true); });
    el.confirmModal.addEventListener('mousedown', function (e) {
      if (e.target === el.confirmModal) settleConfirm(false);
    });
    document.addEventListener('keydown', onModalKeydown);
  }

  function boot() {
    cacheDom();
    populateCategories();
    wireEvents();
    api('me').then(function (data) {
      state.csrf = data.csrfFromCookie || '';
      enterDashboard();
    }, function (err) {
      if (err.status === 503) {
        showLogin(err.message);
      } else {
        showLogin();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
