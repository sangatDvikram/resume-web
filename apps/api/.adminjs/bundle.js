(function (require$$0, require$$1) {
	'use strict';

	function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

	var require$$0__default = /*#__PURE__*/_interopDefault(require$$0);
	var require$$1__default = /*#__PURE__*/_interopDefault(require$$1);

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var markdownEditor = {};

	var __createBinding$6 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$6 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$6 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$6(result, mod, k[i]);
	    __setModuleDefault$6(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(markdownEditor, "__esModule", {
	  value: true
	});
	const react_1$6 = __importStar$6(require$$0__default.default);
	function esc(s) {
	  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}
	function renderMarkdown(raw) {
	  const saved = [];
	  let s = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
	    saved.push(`<pre style="background:#0d1117;padding:12px;border-radius:6px;overflow:auto"><code>${esc(code.trim())}</code></pre>`);
	    return `\x00CB${saved.length - 1}\x00`;
	  });
	  s = s.replace(/`([^`\n]+)`/g, (_, c) => `<code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:0.9em">${esc(c)}</code>`);
	  const lines = s.split('\n');
	  const out = [];
	  let listBuf = [];
	  let listType = 'ul';
	  const flushList = () => {
	    if (!listBuf.length) return;
	    out.push(`<${listType} style="padding-left:1.5em;margin:0.5em 0">${listBuf.join('')}</${listType}>`);
	    listBuf = [];
	  };
	  for (const line of lines) {
	    const h = line.match(/^(#{1,6})\s+(.+)/);
	    if (h) {
	      flushList();
	      out.push(`<h${h[1].length} style="margin:0.75em 0 0.25em">${h[2]}</h${h[1].length}>`);
	      continue;
	    }
	    const bq = line.match(/^>\s*(.*)/);
	    if (bq) {
	      flushList();
	      out.push(`<blockquote style="border-left:3px solid #6366f1;margin:0.5em 0;padding:4px 12px;color:#94a3b8">${bq[1]}</blockquote>`);
	      continue;
	    }
	    if (/^[-*_]{3,}$/.test(line.trim())) {
	      flushList();
	      out.push('<hr style="border:none;border-top:1px solid #334155;margin:1em 0">');
	      continue;
	    }
	    const ulm = line.match(/^(\s*)[-*+]\s+(.*)/);
	    const olm = line.match(/^(\s*)\d+\.\s+(.*)/);
	    if (ulm || olm) {
	      const type = ulm ? 'ul' : 'ol';
	      if (listBuf.length && type !== listType) flushList();
	      listType = type;
	      listBuf.push(`<li>${(ulm ?? olm)[2]}</li>`);
	      continue;
	    }
	    flushList();
	    out.push(line);
	  }
	  flushList();
	  s = out.join('\n');
	  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
	  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
	  s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
	  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px;margin:0.5em 0">');
	  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#6366f1">$1</a>');
	  const sections = s.split(/\n\n+/);
	  s = sections.map(sec => {
	    const t = sec.trim();
	    if (!t) return '';
	    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr|img)/.test(t) || t.startsWith('\x00CB')) return t;
	    return `<p style="margin:0.5em 0;line-height:1.7">${t.replace(/\n/g, '<br>')}</p>`;
	  }).join('\n');
	  saved.forEach((blk, i) => {
	    s = s.replace(`\x00CB${i}\x00`, blk);
	  });
	  return s;
	}
	const MarkdownEditor = ({
	  property,
	  record,
	  onChange
	}) => {
	  const fieldPath = property.path;
	  const initialValue = record?.params?.[fieldPath] ?? '';
	  const [value, setValue] = (0, react_1$6.useState)(initialValue);
	  const [preview, setPreview] = (0, react_1$6.useState)(() => renderMarkdown(initialValue));
	  const [uploading, setUploading] = (0, react_1$6.useState)(false);
	  const [activeTab, setActiveTab] = (0, react_1$6.useState)('split');
	  const textareaRef = (0, react_1$6.useRef)(null);
	  const fileInputRef = (0, react_1$6.useRef)(null);
	  const debounceRef = (0, react_1$6.useRef)(null);
	  (0, react_1$6.useEffect)(() => {
	    const v = record?.params?.[fieldPath] ?? '';
	    setValue(v);
	    setPreview(renderMarkdown(v));
	  }, [record?.id]);
	  const handleChange = (0, react_1$6.useCallback)(e => {
	    const v = e.target.value;
	    setValue(v);
	    onChange(fieldPath, v);
	    if (debounceRef.current) clearTimeout(debounceRef.current);
	    debounceRef.current = setTimeout(() => setPreview(renderMarkdown(v)), 300);
	  }, [fieldPath, onChange]);
	  const insertAtCursor = (0, react_1$6.useCallback)(text => {
	    const ta = textareaRef.current;
	    if (!ta) return;
	    const start = ta.selectionStart ?? value.length;
	    const end = ta.selectionEnd ?? value.length;
	    const next = value.slice(0, start) + text + value.slice(end);
	    setValue(next);
	    onChange(fieldPath, next);
	    setPreview(renderMarkdown(next));
	    setTimeout(() => {
	      ta.selectionStart = ta.selectionEnd = start + text.length;
	      ta.focus();
	    }, 0);
	  }, [value, fieldPath, onChange]);
	  const handleUpload = async e => {
	    const file = e.target.files?.[0];
	    if (!file) return;
	    setUploading(true);
	    try {
	      const fd = new FormData();
	      fd.append('file', file);
	      const res = await fetch('/v1/upload', {
	        method: 'POST',
	        body: fd,
	        credentials: 'include'
	      });
	      if (!res.ok) throw new Error(`HTTP ${res.status}`);
	      const {
	        url
	      } = await res.json();
	      insertAtCursor(`![${file.name.replace(/\.[^.]+$/, '')}](${url})`);
	    } catch (err) {
	      alert(`Image upload failed: ${err?.message ?? 'unknown error'}`);
	    } finally {
	      setUploading(false);
	      if (fileInputRef.current) fileInputRef.current.value = '';
	    }
	  };
	  const editorStyle = {
	    flex: 1,
	    fontFamily: '"Fira Code","Cascadia Code","JetBrains Mono",monospace',
	    fontSize: '13px',
	    lineHeight: '1.65',
	    padding: '12px',
	    border: '1px solid #334155',
	    borderRadius: '6px',
	    resize: 'none',
	    background: '#0f172a',
	    color: '#e2e8f0',
	    minHeight: '460px',
	    boxSizing: 'border-box',
	    overflowY: 'auto'
	  };
	  const previewStyle = {
	    flex: 1,
	    padding: '12px 16px',
	    border: '1px solid #334155',
	    borderRadius: '6px',
	    background: '#0f172a',
	    color: '#e2e8f0',
	    minHeight: '460px',
	    overflowY: 'auto',
	    fontSize: '14px',
	    lineHeight: '1.7',
	    boxSizing: 'border-box'
	  };
	  const tabBtn = active => ({
	    padding: '5px 14px',
	    fontSize: '12px',
	    fontWeight: 600,
	    cursor: 'pointer',
	    border: '1px solid #334155',
	    borderRadius: '5px',
	    background: active ? '#6366f1' : 'transparent',
	    color: active ? '#fff' : '#94a3b8'
	  });
	  const showEditor = activeTab !== 'preview';
	  const showPreview = activeTab !== 'editor';
	  return react_1$6.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: '8px'
	    }
	  }, react_1$6.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '6px',
	      alignItems: 'center',
	      flexWrap: 'wrap'
	    }
	  }, react_1$6.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '4px'
	    }
	  }, ['split', 'editor', 'preview'].map(t => react_1$6.default.createElement("button", {
	    key: t,
	    type: "button",
	    style: tabBtn(activeTab === t),
	    onClick: () => setActiveTab(t)
	  }, t === 'split' ? '⊟ Split' : t === 'editor' ? '✏ Editor' : '👁 Preview'))), react_1$6.default.createElement("div", {
	    style: {
	      flex: 1
	    }
	  }), [{
	    label: 'B',
	    title: 'Bold',
	    insert: '**bold**'
	  }, {
	    label: 'I',
	    title: 'Italic',
	    insert: '*italic*'
	  }, {
	    label: 'H',
	    title: 'Heading',
	    insert: '## Heading\n'
	  }, {
	    label: '`',
	    title: 'Inline code',
	    insert: '`code`'
	  }, {
	    label: '≡',
	    title: 'Code block',
	    insert: '```\ncode\n```\n'
	  }, {
	    label: '→',
	    title: 'Link',
	    insert: '[text](url)'
	  }].map(({
	    label,
	    title,
	    insert
	  }) => react_1$6.default.createElement("button", {
	    key: label,
	    type: "button",
	    title: title,
	    onClick: () => insertAtCursor(insert),
	    style: {
	      padding: '4px 10px',
	      fontSize: '12px',
	      fontWeight: 700,
	      border: '1px solid #334155',
	      borderRadius: '4px',
	      background: 'transparent',
	      color: '#94a3b8',
	      cursor: 'pointer'
	    }
	  }, label)), react_1$6.default.createElement("button", {
	    type: "button",
	    disabled: uploading,
	    onClick: () => fileInputRef.current?.click(),
	    style: {
	      padding: '5px 12px',
	      fontSize: '12px',
	      fontWeight: 600,
	      border: '1px solid #6366f1',
	      borderRadius: '4px',
	      background: uploading ? '#1e293b' : '#6366f120',
	      color: '#818cf8',
	      cursor: uploading ? 'not-allowed' : 'pointer'
	    }
	  }, uploading ? '⏳ Uploading…' : '📷 Image'), react_1$6.default.createElement("input", {
	    ref: fileInputRef,
	    type: "file",
	    accept: "image/*",
	    style: {
	      display: 'none'
	    },
	    onChange: handleUpload
	  })), react_1$6.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '8px'
	    }
	  }, showEditor && react_1$6.default.createElement("textarea", {
	    ref: textareaRef,
	    value: value,
	    onChange: handleChange,
	    spellCheck: false,
	    style: editorStyle,
	    placeholder: "Write Markdown here\u2026"
	  }), showPreview && react_1$6.default.createElement("div", {
	    style: previewStyle,
	    dangerouslySetInnerHTML: {
	      __html: preview || '<span style="color:#475569">Preview will appear here…</span>'
	    }
	  })), react_1$6.default.createElement("p", {
	    style: {
	      fontSize: '11px',
	      color: '#475569',
	      margin: 0
	    }
	  }, "GFM supported \u00B7 preview debounced 300 ms \u00B7 Ctrl+Z to undo"));
	};
	var _default$6 = markdownEditor.default = MarkdownEditor;

	var tagPicker = {};

	var __createBinding$5 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$5 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$5 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$5(result, mod, k[i]);
	    __setModuleDefault$5(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(tagPicker, "__esModule", {
	  value: true
	});
	const react_1$5 = __importStar$5(require$$0__default.default);
	const adminjs_1$1 = require$$1__default.default;
	const api = new adminjs_1$1.ApiClient();
	const TagPicker = ({
	  property,
	  record,
	  onChange
	}) => {
	  const [allTags, setAllTags] = (0, react_1$5.useState)([]);
	  const [selected, setSelected] = (0, react_1$5.useState)([]);
	  const [query, setQuery] = (0, react_1$5.useState)('');
	  const [showDropdown, setShowDropdown] = (0, react_1$5.useState)(false);
	  const inputRef = (0, react_1$5.useRef)(null);
	  (0, react_1$5.useEffect)(() => {
	    fetch('/v1/blog/tags', {
	      credentials: 'include'
	    }).then(r => r.json()).then(tags => setAllTags(tags)).catch(() => {});
	    const params = record?.params ?? {};
	    const fromParams = [];
	    let i = 0;
	    while (params[`${property.path}.${i}.id`]) {
	      const id = params[`${property.path}.${i}.id`];
	      const name = params[`${property.path}.${i}.name`];
	      if (id && name) fromParams.push({
	        id,
	        name
	      });
	      i++;
	    }
	    const populated = record?.populated?.[property.path] ?? [];
	    const fromPopulated = populated.map(r => ({
	      id: r.params?.id,
	      name: r.params?.name
	    })).filter(t => t.id && t.name);
	    const seen = new Set();
	    const merged = [...fromParams, ...fromPopulated].filter(t => !seen.has(t.id) && seen.add(t.id));
	    setSelected(merged);
	  }, [record?.id]);
	  const emit = tags => {
	    onChange(property.path, tags.length > 0 ? tags.map(t => t.id) : ['__empty__']);
	  };
	  const addTag = tag => {
	    if (selected.some(s => s.id === tag.id)) return;
	    const next = [...selected, tag];
	    setSelected(next);
	    emit(next);
	    setQuery('');
	    setShowDropdown(false);
	  };
	  const removeTag = id => {
	    const next = selected.filter(t => t.id !== id);
	    setSelected(next);
	    emit(next);
	  };
	  const createTag = async () => {
	    const name = query.trim().toLowerCase();
	    if (!name) return;
	    const existing = allTags.find(t => t.name === name);
	    if (existing) {
	      addTag(existing);
	      return;
	    }
	    try {
	      const res = await api.resourceAction({
	        resourceId: 'Tag',
	        actionName: 'new',
	        data: {
	          name
	        }
	      });
	      const created = {
	        id: res.data?.record?.params?.id,
	        name: res.data?.record?.params?.name ?? name
	      };
	      setAllTags(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
	      addTag(created);
	    } catch {
	      alert(`Could not create tag "${name}". Please try again.`);
	    }
	  };
	  const filtered = allTags.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) && !selected.some(s => s.id === t.id));
	  const chip = {
	    display: 'inline-flex',
	    alignItems: 'center',
	    gap: '4px',
	    padding: '3px 10px',
	    backgroundColor: '#3d5af1',
	    color: '#fff',
	    borderRadius: '20px',
	    fontSize: '12px',
	    fontWeight: 500
	  };
	  const removeBtn = {
	    background: 'none',
	    border: 'none',
	    color: '#fff',
	    cursor: 'pointer',
	    lineHeight: 1,
	    padding: '0 0 0 2px',
	    fontSize: '14px'
	  };
	  return react_1$5.default.createElement("div", {
	    style: {
	      position: 'relative'
	    }
	  }, react_1$5.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexWrap: 'wrap',
	      gap: '6px',
	      marginBottom: '8px',
	      minHeight: '28px'
	    }
	  }, selected.map(tag => react_1$5.default.createElement("span", {
	    key: tag.id,
	    style: chip
	  }, tag.name, react_1$5.default.createElement("button", {
	    type: "button",
	    style: removeBtn,
	    onClick: () => removeTag(tag.id)
	  }, "\u00D7")))), react_1$5.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '6px'
	    }
	  }, react_1$5.default.createElement("input", {
	    ref: inputRef,
	    type: "text",
	    value: query,
	    onChange: e => {
	      setQuery(e.target.value);
	      setShowDropdown(true);
	    },
	    onFocus: () => setShowDropdown(true),
	    onBlur: () => setTimeout(() => setShowDropdown(false), 200),
	    onKeyDown: e => {
	      if (e.key === 'Enter') {
	        e.preventDefault();
	        createTag();
	      }
	    },
	    placeholder: "Search or create a tag\u2026",
	    style: {
	      flex: 1,
	      padding: '7px 11px',
	      border: '1px solid #4a4a6a',
	      borderRadius: '5px',
	      fontSize: '13px',
	      backgroundColor: '#1a1a2e',
	      color: '#e0e0e0'
	    }
	  }), query.trim() && react_1$5.default.createElement("button", {
	    type: "button",
	    onClick: createTag,
	    style: {
	      padding: '7px 14px',
	      backgroundColor: '#22c55e',
	      color: '#fff',
	      border: 'none',
	      borderRadius: '5px',
	      cursor: 'pointer',
	      fontSize: '13px',
	      fontWeight: 500
	    }
	  }, "+ Add")), showDropdown && filtered.length > 0 && react_1$5.default.createElement("ul", {
	    style: {
	      position: 'absolute',
	      top: '100%',
	      left: 0,
	      right: 0,
	      zIndex: 9999,
	      backgroundColor: '#fff',
	      border: '1px solid #ccc',
	      borderRadius: '5px',
	      listStyle: 'none',
	      margin: '2px 0',
	      padding: 0,
	      maxHeight: '200px',
	      overflowY: 'auto',
	      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
	    }
	  }, filtered.map(tag => react_1$5.default.createElement("li", {
	    key: tag.id,
	    onMouseDown: () => addTag(tag),
	    style: {
	      padding: '8px 12px',
	      cursor: 'pointer',
	      fontSize: '13px',
	      color: '#333'
	    }
	  }, tag.name))), react_1$5.default.createElement("p", {
	    style: {
	      fontSize: '11px',
	      color: '#888',
	      margin: '6px 0 0'
	    }
	  }, "Type to search existing tags \u00B7 press Enter or click \"+ Add\" to create new"));
	};
	var _default$5 = tagPicker.default = TagPicker;

	var skillPicker = {};

	var __createBinding$4 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$4 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$4 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$4(result, mod, k[i]);
	    __setModuleDefault$4(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(skillPicker, "__esModule", {
	  value: true
	});
	var _default$4 = skillPicker.default = SkillPicker;
	const react_1$4 = __importStar$4(require$$0__default.default);
	function SkillPicker({
	  property,
	  record,
	  onChange
	}) {
	  const [skills, setSkills] = (0, react_1$4.useState)([]);
	  const [query, setQuery] = (0, react_1$4.useState)('');
	  const [selected, setSelected] = (0, react_1$4.useState)([]);
	  const [loading, setLoading] = (0, react_1$4.useState)(false);
	  (0, react_1$4.useEffect)(() => {
	    const ids = [];
	    Object.entries(record.params ?? {}).forEach(([key, val]) => {
	      if (key.startsWith(`${property.path}.`) && key.endsWith('.id')) {
	        ids.push(val);
	      }
	    });
	    const populated = (record.populated ?? {})[property.path];
	    if (populated) {
	      ids.push(...populated.map(s => s.params?.id ?? s.id).filter(Boolean));
	    }
	    setSelected([...new Set(ids)]);
	  }, []);
	  (0, react_1$4.useEffect)(() => {
	    setLoading(true);
	    const base = window.__API_BASE__ ?? `${window.location.protocol}//${window.location.hostname}:3001`;
	    fetch(`${base}/v1/resume`).then(r => r.json()).then(data => setSkills(data?.skills ?? [])).catch(() => {}).finally(() => setLoading(false));
	  }, []);
	  const toggle = (0, react_1$4.useCallback)(id => {
	    setSelected(prev => {
	      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
	      onChange(property.path, next.length > 0 ? next : ['__empty__']);
	      return next;
	    });
	  }, [onChange, property.path]);
	  const filtered = query ? skills.filter(s => s.name.toLowerCase().includes(query.toLowerCase())) : skills;
	  const categories = [...new Set(filtered.map(s => s.category))].sort();
	  return react_1$4.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 8
	    }
	  }, react_1$4.default.createElement("label", {
	    style: {
	      fontSize: 12,
	      fontWeight: 600,
	      textTransform: 'uppercase',
	      letterSpacing: 1,
	      opacity: 0.7
	    }
	  }, property.label), selected.length > 0 && react_1$4.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexWrap: 'wrap',
	      gap: 4
	    }
	  }, selected.map(id => {
	    const sk = skills.find(s => s.id === id);
	    return sk ? react_1$4.default.createElement("span", {
	      key: id,
	      style: {
	        padding: '2px 8px',
	        borderRadius: 4,
	        fontSize: 11,
	        fontWeight: 500,
	        background: 'rgba(99,102,241,0.15)',
	        border: '1px solid rgba(99,102,241,0.35)',
	        display: 'flex',
	        alignItems: 'center',
	        gap: 4,
	        cursor: 'pointer'
	      },
	      onClick: () => toggle(id)
	    }, sk.name, " \u2715") : null;
	  })), react_1$4.default.createElement("input", {
	    type: "text",
	    placeholder: "Filter skills...",
	    value: query,
	    onChange: e => setQuery(e.target.value),
	    style: {
	      width: '100%',
	      padding: '6px 10px',
	      borderRadius: 6,
	      border: '1px solid rgba(128,128,128,0.3)',
	      background: 'transparent',
	      fontSize: 13,
	      color: 'inherit',
	      boxSizing: 'border-box'
	    }
	  }), loading && react_1$4.default.createElement("span", {
	    style: {
	      fontSize: 12,
	      opacity: 0.6
	    }
	  }, "Loading skills\u2026"), react_1$4.default.createElement("div", {
	    style: {
	      maxHeight: 220,
	      overflowY: 'auto',
	      border: '1px solid rgba(128,128,128,0.2)',
	      borderRadius: 6,
	      padding: 8
	    }
	  }, categories.map(cat => react_1$4.default.createElement("div", {
	    key: cat,
	    style: {
	      marginBottom: 10
	    }
	  }, react_1$4.default.createElement("div", {
	    style: {
	      fontSize: 10,
	      fontWeight: 700,
	      textTransform: 'uppercase',
	      letterSpacing: 1,
	      opacity: 0.5,
	      marginBottom: 4
	    }
	  }, cat), filtered.filter(s => s.category === cat).map(skill => react_1$4.default.createElement("label", {
	    key: skill.id,
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 6,
	      fontSize: 13,
	      cursor: 'pointer',
	      padding: '2px 0'
	    }
	  }, react_1$4.default.createElement("input", {
	    type: "checkbox",
	    checked: selected.includes(skill.id),
	    onChange: () => toggle(skill.id),
	    style: {
	      width: 14,
	      height: 14
	    }
	  }), skill.name)))), filtered.length === 0 && !loading && react_1$4.default.createElement("span", {
	    style: {
	      fontSize: 12,
	      opacity: 0.5
	    }
	  }, "No skills found.")));
	}

	var mediaUploader = {};

	var __createBinding$3 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$3 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$3 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$3(result, mod, k[i]);
	    __setModuleDefault$3(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(mediaUploader, "__esModule", {
	  value: true
	});
	var _default$3 = mediaUploader.default = MediaUploader;
	const react_1$3 = __importStar$3(require$$0__default.default);
	function MediaUploader({
	  property,
	  record,
	  onChange
	}) {
	  const apiBase = window.__API_BASE__ ?? `${window.location.protocol}//${window.location.hostname}:3001`;
	  const initial = [];
	  if (record?.params) {
	    let i = 0;
	    while (record.params[`${property.path}.${i}.url`]) {
	      initial.push({
	        id: record.params[`${property.path}.${i}.id`] ?? undefined,
	        url: record.params[`${property.path}.${i}.url`],
	        altText: record.params[`${property.path}.${i}.altText`] ?? ''
	      });
	      i++;
	    }
	  }
	  const [items, setItems] = (0, react_1$3.useState)(initial);
	  const [dragging, setDragging] = (0, react_1$3.useState)(false);
	  const dragIdx = (0, react_1$3.useRef)(null);
	  const fileRef = (0, react_1$3.useRef)(null);
	  const emit = (0, react_1$3.useCallback)(next => {
	    setItems(next);
	    onChange(property.path, next.filter(m => !m.uploading && !m.error));
	  }, [onChange, property.path]);
	  const uploadFiles = async files => {
	    if (!files || !files.length) return;
	    const placeholders = Array.from(files).map(f => ({
	      url: URL.createObjectURL(f),
	      altText: '',
	      uploading: true
	    }));
	    setItems(prev => [...prev, ...placeholders]);
	    for (let i = 0; i < files.length; i++) {
	      const file = files[i];
	      const fd = new FormData();
	      fd.append('file', file);
	      try {
	        const res = await fetch(`${apiBase}/v1/upload`, {
	          method: 'POST',
	          body: fd,
	          credentials: 'include'
	        });
	        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
	        const {
	          url
	        } = await res.json();
	        setItems(prev => {
	          const next = [...prev];
	          const idx = next.findIndex(m => m.uploading && m.url === placeholders[i].url);
	          if (idx !== -1) next[idx] = {
	            url,
	            altText: '',
	            uploading: false
	          };
	          onChange(property.path, next.filter(m => !m.uploading));
	          return next;
	        });
	      } catch (err) {
	        setItems(prev => {
	          const next = [...prev];
	          const idx = next.findIndex(m => m.uploading && m.url === placeholders[i].url);
	          if (idx !== -1) next[idx] = {
	            ...next[idx],
	            uploading: false,
	            error: err.message
	          };
	          return next;
	        });
	      }
	    }
	  };
	  const onDragStart = i => {
	    dragIdx.current = i;
	  };
	  const onDragOver = (e, i) => {
	    e.preventDefault();
	    if (dragIdx.current === null || dragIdx.current === i) return;
	    setItems(prev => {
	      const next = [...prev];
	      const [moved] = next.splice(dragIdx.current, 1);
	      next.splice(i, 0, moved);
	      dragIdx.current = i;
	      onChange(property.path, next.filter(m => !m.uploading));
	      return next;
	    });
	  };
	  const onDropZone = e => {
	    e.preventDefault();
	    setDragging(false);
	    uploadFiles(e.dataTransfer.files);
	  };
	  return react_1$3.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 12
	    }
	  }, react_1$3.default.createElement("div", {
	    onDragOver: e => {
	      e.preventDefault();
	      setDragging(true);
	    },
	    onDragLeave: () => setDragging(false),
	    onDrop: onDropZone,
	    onClick: () => fileRef.current?.click(),
	    style: {
	      border: `2px dashed ${dragging ? '#818cf8' : 'rgba(128,128,128,0.3)'}`,
	      borderRadius: 8,
	      padding: '24px 16px',
	      textAlign: 'center',
	      cursor: 'pointer',
	      background: dragging ? 'rgba(99,102,241,0.05)' : 'transparent',
	      transition: 'all 150ms'
	    }
	  }, react_1$3.default.createElement("span", {
	    style: {
	      fontSize: 13,
	      opacity: 0.7
	    }
	  }, "Drop images here or ", react_1$3.default.createElement("strong", null, "click to browse")), react_1$3.default.createElement("input", {
	    ref: fileRef,
	    type: "file",
	    multiple: true,
	    accept: "image/*",
	    style: {
	      display: 'none'
	    },
	    onChange: e => uploadFiles(e.target.files)
	  })), items.length > 0 && react_1$3.default.createElement("div", {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
	      gap: 8
	    }
	  }, items.map((item, i) => react_1$3.default.createElement("div", {
	    key: i,
	    draggable: !item.uploading,
	    onDragStart: () => onDragStart(i),
	    onDragOver: e => onDragOver(e, i),
	    style: {
	      position: 'relative',
	      borderRadius: 8,
	      overflow: 'hidden',
	      border: '1px solid rgba(128,128,128,0.2)',
	      cursor: item.uploading ? 'default' : 'grab',
	      opacity: item.uploading ? 0.6 : 1
	    }
	  }, react_1$3.default.createElement("img", {
	    src: item.url,
	    alt: item.altText,
	    style: {
	      width: '100%',
	      height: 80,
	      objectFit: 'cover',
	      display: 'block'
	    }
	  }), item.uploading && react_1$3.default.createElement("div", {
	    style: {
	      position: 'absolute',
	      inset: 0,
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'center',
	      background: 'rgba(0,0,0,0.4)',
	      fontSize: 10,
	      color: '#fff'
	    }
	  }, "Uploading\u2026"), item.error && react_1$3.default.createElement("div", {
	    style: {
	      position: 'absolute',
	      inset: 0,
	      background: 'rgba(220,38,38,0.7)',
	      fontSize: 9,
	      color: '#fff',
	      padding: 4,
	      overflow: 'hidden'
	    }
	  }, item.error), !item.uploading && react_1$3.default.createElement(react_1$3.default.Fragment, null, react_1$3.default.createElement("input", {
	    type: "text",
	    placeholder: "Alt text",
	    value: item.altText,
	    onChange: e => emit(items.map((it, j) => j === i ? {
	      ...it,
	      altText: e.target.value
	    } : it)),
	    style: {
	      width: '100%',
	      fontSize: 10,
	      padding: '3px 6px',
	      border: 'none',
	      borderTop: '1px solid rgba(128,128,128,0.2)',
	      background: 'transparent',
	      boxSizing: 'border-box'
	    }
	  }), react_1$3.default.createElement("button", {
	    onClick: () => emit(items.filter((_, j) => j !== i)),
	    style: {
	      position: 'absolute',
	      top: 4,
	      right: 4,
	      background: 'rgba(220,38,38,0.8)',
	      border: 'none',
	      borderRadius: 4,
	      color: '#fff',
	      fontSize: 10,
	      cursor: 'pointer',
	      padding: '1px 5px'
	    },
	    title: "Remove"
	  }, "\u2715"))))));
	}

	var videoManager = {};

	var __createBinding$2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$2 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$2(result, mod, k[i]);
	    __setModuleDefault$2(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(videoManager, "__esModule", {
	  value: true
	});
	var _default$2 = videoManager.default = VideoManager;
	const react_1$2 = __importStar$2(require$$0__default.default);
	function detectSource(url) {
	  if (/youtu(\.be|be\.com)/i.test(url)) return 'youtube';
	  if (/vimeo\.com/i.test(url)) return 'vimeo';
	  return 'self_hosted';
	}
	function VideoManager({
	  property,
	  record,
	  onChange
	}) {
	  const initial = [];
	  if (record?.params) {
	    let i = 0;
	    while (record.params[`${property.path}.${i}.url`]) {
	      initial.push({
	        id: record.params[`${property.path}.${i}.id`] ?? undefined,
	        source: record.params[`${property.path}.${i}.source`] ?? 'self_hosted',
	        url: record.params[`${property.path}.${i}.url`],
	        title: record.params[`${property.path}.${i}.title`] ?? ''
	      });
	      i++;
	    }
	  }
	  const [items, setItems] = (0, react_1$2.useState)(initial);
	  const [newUrl, setNewUrl] = (0, react_1$2.useState)('');
	  const [newTitle, setNewTitle] = (0, react_1$2.useState)('');
	  const dragIdx = (0, react_1$2.useRef)(null);
	  const emit = (0, react_1$2.useCallback)(next => {
	    setItems(next);
	    onChange(property.path, next);
	  }, [onChange, property.path]);
	  const addItem = () => {
	    const url = newUrl.trim();
	    if (!url) return;
	    const item = {
	      source: detectSource(url),
	      url,
	      title: newTitle.trim()
	    };
	    emit([...items, item]);
	    setNewUrl('');
	    setNewTitle('');
	  };
	  const onDragStart = i => {
	    dragIdx.current = i;
	  };
	  const onDragOver = (e, i) => {
	    e.preventDefault();
	    if (dragIdx.current === null || dragIdx.current === i) return;
	    const next = [...items];
	    const [moved] = next.splice(dragIdx.current, 1);
	    next.splice(i, 0, moved);
	    dragIdx.current = i;
	    emit(next);
	  };
	  const labelStyle = {
	    fontSize: 10,
	    fontWeight: 700,
	    textTransform: 'uppercase',
	    letterSpacing: 1,
	    opacity: 0.5,
	    marginBottom: 4
	  };
	  const inputStyle = {
	    width: '100%',
	    padding: '6px 10px',
	    borderRadius: 6,
	    border: '1px solid rgba(128,128,128,0.3)',
	    background: 'transparent',
	    fontSize: 13,
	    color: 'inherit',
	    boxSizing: 'border-box'
	  };
	  return react_1$2.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 12
	    }
	  }, react_1$2.default.createElement("label", {
	    style: {
	      fontSize: 12,
	      fontWeight: 600,
	      textTransform: 'uppercase',
	      letterSpacing: 1,
	      opacity: 0.7
	    }
	  }, property.path.charAt(0).toUpperCase() + property.path.slice(1)), react_1$2.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 6,
	      padding: 12,
	      borderRadius: 8,
	      border: '1px solid rgba(128,128,128,0.2)'
	    }
	  }, react_1$2.default.createElement("div", {
	    style: labelStyle
	  }, "Add video"), react_1$2.default.createElement("input", {
	    type: "url",
	    placeholder: "YouTube, Vimeo, or MP4 URL",
	    value: newUrl,
	    onChange: e => setNewUrl(e.target.value),
	    onKeyDown: e => e.key === 'Enter' && addItem(),
	    style: inputStyle
	  }), react_1$2.default.createElement("input", {
	    type: "text",
	    placeholder: "Title (optional)",
	    value: newTitle,
	    onChange: e => setNewTitle(e.target.value),
	    onKeyDown: e => e.key === 'Enter' && addItem(),
	    style: inputStyle
	  }), react_1$2.default.createElement("button", {
	    onClick: addItem,
	    style: {
	      alignSelf: 'flex-start',
	      padding: '6px 14px',
	      borderRadius: 6,
	      border: 'none',
	      cursor: 'pointer',
	      background: '#6366f1',
	      color: '#fff',
	      fontSize: 12,
	      fontWeight: 600
	    }
	  }, "+ Add")), items.length > 0 && react_1$2.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 6
	    }
	  }, items.map((item, i) => react_1$2.default.createElement("div", {
	    key: i,
	    draggable: true,
	    onDragStart: () => onDragStart(i),
	    onDragOver: e => onDragOver(e, i),
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 8,
	      padding: '8px 10px',
	      borderRadius: 8,
	      border: '1px solid rgba(128,128,128,0.2)',
	      cursor: 'grab'
	    }
	  }, react_1$2.default.createElement("span", {
	    style: {
	      fontSize: 9,
	      padding: '2px 6px',
	      borderRadius: 4,
	      fontWeight: 700,
	      background: item.source === 'youtube' ? 'rgba(220,38,38,0.15)' : item.source === 'vimeo' ? 'rgba(14,165,233,0.15)' : 'rgba(99,102,241,0.15)',
	      color: item.source === 'youtube' ? '#dc2626' : item.source === 'vimeo' ? '#0ea5e9' : '#6366f1',
	      textTransform: 'uppercase',
	      letterSpacing: 1,
	      flexShrink: 0
	    }
	  }, item.source.replace('_', ' ')), react_1$2.default.createElement("div", {
	    style: {
	      flex: 1,
	      overflow: 'hidden'
	    }
	  }, react_1$2.default.createElement("div", {
	    style: {
	      fontSize: 12,
	      fontWeight: 500,
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, item.title || item.url), item.title && react_1$2.default.createElement("div", {
	    style: {
	      fontSize: 10,
	      opacity: 0.5,
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, item.url)), react_1$2.default.createElement("input", {
	    type: "text",
	    placeholder: "Title",
	    value: item.title,
	    onChange: e => emit(items.map((it, j) => j === i ? {
	      ...it,
	      title: e.target.value
	    } : it)),
	    style: {
	      ...inputStyle,
	      width: 120,
	      flexShrink: 0
	    }
	  }), react_1$2.default.createElement("button", {
	    onClick: () => emit(items.filter((_, j) => j !== i)),
	    style: {
	      flexShrink: 0,
	      background: 'rgba(220,38,38,0.15)',
	      border: 'none',
	      borderRadius: 4,
	      color: '#dc2626',
	      fontSize: 11,
	      cursor: 'pointer',
	      padding: '3px 7px'
	    }
	  }, "\u2715"), react_1$2.default.createElement("span", {
	    style: {
	      flexShrink: 0,
	      opacity: 0.3,
	      fontSize: 14,
	      cursor: 'grab'
	    }
	  }, "\u283F")))));
	}

	var photoUploader = {};

	var __createBinding$1 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$1 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$1 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$1(result, mod, k[i]);
	    __setModuleDefault$1(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(photoUploader, "__esModule", {
	  value: true
	});
	var _default$1 = photoUploader.default = PhotoUploader;
	const react_1$1 = __importStar$1(require$$0__default.default);
	function PhotoUploader({
	  property,
	  record,
	  onChange
	}) {
	  const apiBase = window.__API_BASE__ ?? `${window.location.protocol}//${window.location.hostname}:3001`;
	  const existingUrl = record?.params?.[property.path] ?? '';
	  const [items, setItems] = (0, react_1$1.useState)([]);
	  const [dragging, setDragging] = (0, react_1$1.useState)(false);
	  const fileRef = (0, react_1$1.useRef)(null);
	  const update = (0, react_1$1.useCallback)((idx, patch) => setItems(prev => prev.map((it, i) => i === idx ? {
	    ...it,
	    ...patch
	  } : it)), []);
	  const uploadOne = (0, react_1$1.useCallback)(async (item, idx) => {
	    update(idx, {
	      state: 'uploading',
	      progress: 0
	    });
	    const fd = new FormData();
	    fd.append('file', item.file);
	    try {
	      const xhr = new XMLHttpRequest();
	      await new Promise((resolve, reject) => {
	        xhr.upload.addEventListener('progress', e => {
	          if (e.lengthComputable) {
	            update(idx, {
	              progress: Math.round(e.loaded / e.total * 90)
	            });
	          }
	        });
	        xhr.addEventListener('load', () => {
	          if (xhr.status >= 200 && xhr.status < 300) {
	            try {
	              const data = JSON.parse(xhr.responseText);
	              update(idx, {
	                state: 'done',
	                progress: 100,
	                resultUrl: data.originalUrl
	              });
	              onChange(property.path, data.originalUrl);
	              resolve();
	            } catch {
	              reject(new Error('Invalid JSON response'));
	            }
	          } else {
	            reject(new Error(`Upload failed: HTTP ${xhr.status}`));
	          }
	        });
	        xhr.addEventListener('error', () => reject(new Error('Network error')));
	        xhr.open('POST', `${apiBase}/v1/gallery/photos/upload`);
	        xhr.withCredentials = true;
	        xhr.send(fd);
	      });
	    } catch (err) {
	      update(idx, {
	        state: 'error',
	        error: err.message
	      });
	    }
	  }, [apiBase, onChange, property.path, update]);
	  const addFiles = (0, react_1$1.useCallback)(fileList => {
	    if (!fileList) return;
	    const allowed = Math.min(fileList.length, 50 - items.length);
	    const newItems = Array.from(fileList).slice(0, allowed).map(f => ({
	      file: f,
	      localUrl: URL.createObjectURL(f),
	      state: 'pending',
	      progress: 0
	    }));
	    setItems(prev => {
	      const next = [...prev, ...newItems];
	      newItems.forEach((it, i) => void uploadOne(it, prev.length + i));
	      return next;
	    });
	  }, [items.length, uploadOne]);
	  const stateColor = {
	    pending: '#6b7280',
	    uploading: '#6366f1',
	    done: '#22c55e',
	    error: '#ef4444'
	  };
	  return react_1$1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 12
	    }
	  }, existingUrl && react_1$1.default.createElement("img", {
	    src: existingUrl,
	    alt: "Current",
	    style: {
	      width: 120,
	      height: 80,
	      objectFit: 'cover',
	      borderRadius: 6,
	      border: '1px solid rgba(128,128,128,0.2)'
	    }
	  }), items.length < 50 && react_1$1.default.createElement("div", {
	    onDragOver: e => {
	      e.preventDefault();
	      setDragging(true);
	    },
	    onDragLeave: () => setDragging(false),
	    onDrop: e => {
	      e.preventDefault();
	      setDragging(false);
	      addFiles(e.dataTransfer.files);
	    },
	    onClick: () => fileRef.current?.click(),
	    style: {
	      border: `2px dashed ${dragging ? '#818cf8' : 'rgba(128,128,128,0.3)'}`,
	      borderRadius: 8,
	      padding: '20px 16px',
	      textAlign: 'center',
	      cursor: 'pointer',
	      background: dragging ? 'rgba(99,102,241,0.05)' : 'transparent'
	    }
	  }, react_1$1.default.createElement("span", {
	    style: {
	      fontSize: 13,
	      opacity: 0.7
	    }
	  }, "Drop photos here or ", react_1$1.default.createElement("strong", null, "click to browse"), " (max 50)"), react_1$1.default.createElement("input", {
	    ref: fileRef,
	    type: "file",
	    multiple: true,
	    accept: "image/jpeg,image/png,image/webp,image/gif",
	    style: {
	      display: 'none'
	    },
	    onChange: e => addFiles(e.target.files)
	  })), items.length > 0 && react_1$1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 8
	    }
	  }, items.map((item, i) => react_1$1.default.createElement("div", {
	    key: i,
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 10
	    }
	  }, react_1$1.default.createElement("img", {
	    src: item.resultUrl ?? item.localUrl,
	    alt: item.file.name,
	    style: {
	      width: 48,
	      height: 36,
	      objectFit: 'cover',
	      borderRadius: 4,
	      flexShrink: 0
	    }
	  }), react_1$1.default.createElement("div", {
	    style: {
	      flex: 1,
	      minWidth: 0
	    }
	  }, react_1$1.default.createElement("div", {
	    style: {
	      fontSize: 11,
	      opacity: 0.8,
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, item.file.name), react_1$1.default.createElement("div", {
	    style: {
	      height: 4,
	      borderRadius: 2,
	      background: 'rgba(128,128,128,0.2)',
	      marginTop: 4
	    }
	  }, react_1$1.default.createElement("div", {
	    style: {
	      height: '100%',
	      borderRadius: 2,
	      width: `${item.progress}%`,
	      background: stateColor[item.state],
	      transition: 'width 0.15s ease'
	    }
	  })), item.error && react_1$1.default.createElement("div", {
	    style: {
	      fontSize: 10,
	      color: '#ef4444',
	      marginTop: 2
	    }
	  }, item.error)), react_1$1.default.createElement("span", {
	    style: {
	      fontSize: 10,
	      color: stateColor[item.state],
	      flexShrink: 0
	    }
	  }, item.state === 'uploading' ? `${item.progress}%` : item.state)))));
	}

	var dashboard = {};

	var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
	    __setModuleDefault(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(dashboard, "__esModule", {
	  value: true
	});
	const react_1 = __importStar(require$$0__default.default);
	const adminjs_1 = require$$1__default.default;
	const INITIAL = {
	  publishedPosts: '–',
	  draftPosts: '–',
	  projects: '–',
	  photos: '–',
	  albums: '–'
	};
	const CARDS = [{
	  key: 'publishedPosts',
	  label: 'Published Posts',
	  icon: '📝',
	  accent: '#6366f1'
	}, {
	  key: 'draftPosts',
	  label: 'Draft Posts',
	  icon: '✏️',
	  accent: '#f59e0b'
	}, {
	  key: 'projects',
	  label: 'Projects',
	  icon: '🚀',
	  accent: '#22c55e'
	}, {
	  key: 'photos',
	  label: 'Photos',
	  icon: '📷',
	  accent: '#3b82f6'
	}, {
	  key: 'albums',
	  label: 'Albums',
	  icon: '🗂️',
	  accent: '#a855f7'
	}];
	const Dashboard = () => {
	  const [stats, setStats] = (0, react_1.useState)(INITIAL);
	  const [loading, setLoading] = (0, react_1.useState)(true);
	  const [error, setError] = (0, react_1.useState)(null);
	  (0, react_1.useEffect)(() => {
	    const api = new adminjs_1.ApiClient();
	    async function load() {
	      try {
	        const [pubPostsRes, allPostsRes, projectsRes, photosRes, albumsRes] = await Promise.allSettled([fetch('/v1/blog', {
	          credentials: 'include'
	        }).then(r => r.json()), api.resourceAction({
	          resourceId: 'BlogPost',
	          actionName: 'list',
	          params: {
	            perPage: 1
	          }
	        }), fetch('/v1/projects', {
	          credentials: 'include'
	        }).then(r => r.json()), fetch('/v1/gallery/photos', {
	          credentials: 'include'
	        }).then(r => r.json()), fetch('/v1/gallery/albums', {
	          credentials: 'include'
	        }).then(r => r.json())]);
	        const publishedPosts = pubPostsRes.status === 'fulfilled' ? pubPostsRes.value.length : '–';
	        const totalPosts = allPostsRes.status === 'fulfilled' ? allPostsRes.value?.data?.meta?.total ?? '–' : '–';
	        const draftPosts = typeof totalPosts === 'number' && typeof publishedPosts === 'number' ? totalPosts - publishedPosts : '–';
	        const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.length : '–';
	        const photos = photosRes.status === 'fulfilled' ? photosRes.value?.total ?? '–' : '–';
	        const albums = albumsRes.status === 'fulfilled' ? albumsRes.value.length : '–';
	        setStats({
	          publishedPosts,
	          draftPosts,
	          projects,
	          photos,
	          albums
	        });
	      } catch (e) {
	        setError(e?.message ?? 'Failed to load stats');
	      } finally {
	        setLoading(false);
	      }
	    }
	    void load();
	  }, []);
	  const hour = new Date().getHours();
	  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
	  return react_1.default.createElement("div", {
	    style: {
	      padding: '32px',
	      fontFamily: 'system-ui, sans-serif'
	    }
	  }, react_1.default.createElement("div", {
	    style: {
	      marginBottom: '32px'
	    }
	  }, react_1.default.createElement("h1", {
	    style: {
	      fontSize: '28px',
	      fontWeight: 700,
	      margin: 0,
	      color: '#e2e8f0'
	    }
	  }, greeting, " \uD83D\uDC4B"), react_1.default.createElement("p", {
	    style: {
	      color: '#94a3b8',
	      marginTop: '6px',
	      fontSize: '15px'
	    }
	  }, "Here's a live snapshot of your portfolio content.")), error && react_1.default.createElement("div", {
	    style: {
	      padding: '12px 16px',
	      background: 'rgba(239,68,68,0.15)',
	      border: '1px solid rgba(239,68,68,0.4)',
	      borderRadius: '8px',
	      color: '#fca5a5',
	      marginBottom: '24px',
	      fontSize: '14px'
	    }
	  }, "\u26A0\uFE0F ", error), react_1.default.createElement("div", {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
	      gap: '20px'
	    }
	  }, CARDS.map(({
	    key,
	    label,
	    icon,
	    accent
	  }) => react_1.default.createElement("div", {
	    key: key,
	    style: {
	      background: 'rgba(30,41,59,0.8)',
	      border: `1px solid ${accent}40`,
	      borderRadius: '12px',
	      padding: '24px',
	      boxShadow: `0 0 0 1px ${accent}20, 0 4px 24px rgba(0,0,0,0.3)`,
	      transition: 'transform 150ms'
	    }
	  }, react_1.default.createElement("div", {
	    style: {
	      fontSize: '28px',
	      marginBottom: '12px',
	      lineHeight: 1
	    }
	  }, icon), react_1.default.createElement("div", {
	    style: {
	      fontSize: '36px',
	      fontWeight: 700,
	      color: loading ? '#4b5563' : accent,
	      lineHeight: 1,
	      marginBottom: '6px',
	      transition: 'color 300ms'
	    }
	  }, loading ? '—' : String(stats[key])), react_1.default.createElement("div", {
	    style: {
	      color: '#94a3b8',
	      fontSize: '13px',
	      fontWeight: 500,
	      letterSpacing: '0.025em'
	    }
	  }, label)))), react_1.default.createElement("div", {
	    style: {
	      marginTop: '40px'
	    }
	  }, react_1.default.createElement("h2", {
	    style: {
	      fontSize: '16px',
	      fontWeight: 600,
	      color: '#cbd5e1',
	      marginBottom: '16px'
	    }
	  }, "Quick actions"), react_1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '12px',
	      flexWrap: 'wrap'
	    }
	  }, [{
	    label: '+ New Blog Post',
	    href: '/admin/resources/BlogPost/actions/new',
	    color: '#6366f1'
	  }, {
	    label: '+ New Project',
	    href: '/admin/resources/Project/actions/new',
	    color: '#22c55e'
	  }, {
	    label: '+ New Album',
	    href: '/admin/resources/Album/actions/new',
	    color: '#a855f7'
	  }, {
	    label: '+ Upload Photos',
	    href: '/admin/resources/Photo/actions/new',
	    color: '#3b82f6'
	  }].map(({
	    label,
	    href,
	    color
	  }) => react_1.default.createElement("a", {
	    key: href,
	    href: href,
	    style: {
	      display: 'inline-block',
	      padding: '9px 18px',
	      background: `${color}20`,
	      border: `1px solid ${color}60`,
	      borderRadius: '8px',
	      color,
	      fontSize: '13px',
	      fontWeight: 600,
	      textDecoration: 'none',
	      transition: 'background 150ms'
	    }
	  }, label)))), react_1.default.createElement("p", {
	    style: {
	      color: '#475569',
	      fontSize: '12px',
	      marginTop: '32px'
	    }
	  }, "Stats loaded at ", new Date().toLocaleTimeString()));
	};
	var _default = dashboard.default = Dashboard;

	AdminJS.UserComponents = {};
	AdminJS.UserComponents.MarkdownEditor = _default$6;
	AdminJS.UserComponents.TagPicker = _default$5;
	AdminJS.UserComponents.SkillPicker = _default$4;
	AdminJS.UserComponents.MediaUploader = _default$3;
	AdminJS.UserComponents.VideoManager = _default$2;
	AdminJS.UserComponents.PhotoUploader = _default$1;
	AdminJS.UserComponents.Dashboard = _default;

})(React, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL21hcmtkb3duLWVkaXRvci5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvdGFnLXBpY2tlci5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvc2tpbGwtcGlja2VyLmpzIiwiLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy9tZWRpYS11cGxvYWRlci5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvdmlkZW8tbWFuYWdlci5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvcGhvdG8tdXBsb2FkZXIuanMiLCIuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZC5qcyIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5mdW5jdGlvbiBlc2Mocykge1xuICAgIHJldHVybiBzLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cbmZ1bmN0aW9uIHJlbmRlck1hcmtkb3duKHJhdykge1xuICAgIGNvbnN0IHNhdmVkID0gW107XG4gICAgbGV0IHMgPSByYXcucmVwbGFjZSgvYGBgKFxcdyopXFxuPyhbXFxzXFxTXSo/KWBgYC9nLCAoXywgbGFuZywgY29kZSkgPT4ge1xuICAgICAgICBzYXZlZC5wdXNoKGA8cHJlIHN0eWxlPVwiYmFja2dyb3VuZDojMGQxMTE3O3BhZGRpbmc6MTJweDtib3JkZXItcmFkaXVzOjZweDtvdmVyZmxvdzphdXRvXCI+PGNvZGU+JHtlc2MoY29kZS50cmltKCkpfTwvY29kZT48L3ByZT5gKTtcbiAgICAgICAgcmV0dXJuIGBcXHgwMENCJHtzYXZlZC5sZW5ndGggLSAxfVxceDAwYDtcbiAgICB9KTtcbiAgICBzID0gcy5yZXBsYWNlKC9gKFteYFxcbl0rKWAvZywgKF8sIGMpID0+IGA8Y29kZSBzdHlsZT1cImJhY2tncm91bmQ6IzFlMjkzYjtwYWRkaW5nOjJweCA2cHg7Ym9yZGVyLXJhZGl1czo0cHg7Zm9udC1zaXplOjAuOWVtXCI+JHtlc2MoYyl9PC9jb2RlPmApO1xuICAgIGNvbnN0IGxpbmVzID0gcy5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3Qgb3V0ID0gW107XG4gICAgbGV0IGxpc3RCdWYgPSBbXTtcbiAgICBsZXQgbGlzdFR5cGUgPSAndWwnO1xuICAgIGNvbnN0IGZsdXNoTGlzdCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFsaXN0QnVmLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgb3V0LnB1c2goYDwke2xpc3RUeXBlfSBzdHlsZT1cInBhZGRpbmctbGVmdDoxLjVlbTttYXJnaW46MC41ZW0gMFwiPiR7bGlzdEJ1Zi5qb2luKCcnKX08LyR7bGlzdFR5cGV9PmApO1xuICAgICAgICBsaXN0QnVmID0gW107XG4gICAgfTtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgY29uc3QgaCA9IGxpbmUubWF0Y2goL14oI3sxLDZ9KVxccysoLispLyk7XG4gICAgICAgIGlmIChoKSB7XG4gICAgICAgICAgICBmbHVzaExpc3QoKTtcbiAgICAgICAgICAgIG91dC5wdXNoKGA8aCR7aFsxXS5sZW5ndGh9IHN0eWxlPVwibWFyZ2luOjAuNzVlbSAwIDAuMjVlbVwiPiR7aFsyXX08L2gke2hbMV0ubGVuZ3RofT5gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJxID0gbGluZS5tYXRjaCgvXj5cXHMqKC4qKS8pO1xuICAgICAgICBpZiAoYnEpIHtcbiAgICAgICAgICAgIGZsdXNoTGlzdCgpO1xuICAgICAgICAgICAgb3V0LnB1c2goYDxibG9ja3F1b3RlIHN0eWxlPVwiYm9yZGVyLWxlZnQ6M3B4IHNvbGlkICM2MzY2ZjE7bWFyZ2luOjAuNWVtIDA7cGFkZGluZzo0cHggMTJweDtjb2xvcjojOTRhM2I4XCI+JHticVsxXX08L2Jsb2NrcXVvdGU+YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL15bLSpfXXszLH0kLy50ZXN0KGxpbmUudHJpbSgpKSkge1xuICAgICAgICAgICAgZmx1c2hMaXN0KCk7XG4gICAgICAgICAgICBvdXQucHVzaCgnPGhyIHN0eWxlPVwiYm9yZGVyOm5vbmU7Ym9yZGVyLXRvcDoxcHggc29saWQgIzMzNDE1NTttYXJnaW46MWVtIDBcIj4nKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVsbSA9IGxpbmUubWF0Y2goL14oXFxzKilbLSorXVxccysoLiopLyk7XG4gICAgICAgIGNvbnN0IG9sbSA9IGxpbmUubWF0Y2goL14oXFxzKilcXGQrXFwuXFxzKyguKikvKTtcbiAgICAgICAgaWYgKHVsbSB8fCBvbG0pIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB1bG0gPyAndWwnIDogJ29sJztcbiAgICAgICAgICAgIGlmIChsaXN0QnVmLmxlbmd0aCAmJiB0eXBlICE9PSBsaXN0VHlwZSlcbiAgICAgICAgICAgICAgICBmbHVzaExpc3QoKTtcbiAgICAgICAgICAgIGxpc3RUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIGxpc3RCdWYucHVzaChgPGxpPiR7KHVsbSA/PyBvbG0pWzJdfTwvbGk+YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBmbHVzaExpc3QoKTtcbiAgICAgICAgb3V0LnB1c2gobGluZSk7XG4gICAgfVxuICAgIGZsdXNoTGlzdCgpO1xuICAgIHMgPSBvdXQuam9pbignXFxuJyk7XG4gICAgcyA9IHMucmVwbGFjZSgvXFwqXFwqXFwqKC4rPylcXCpcXCpcXCovZywgJzxzdHJvbmc+PGVtPiQxPC9lbT48L3N0cm9uZz4nKTtcbiAgICBzID0gcy5yZXBsYWNlKC9cXCpcXCooLis/KVxcKlxcKi9nLCAnPHN0cm9uZz4kMTwvc3Ryb25nPicpO1xuICAgIHMgPSBzLnJlcGxhY2UoL1xcKiguKz8pXFwqL2csICc8ZW0+JDE8L2VtPicpO1xuICAgIHMgPSBzLnJlcGxhY2UoL35+KC4rPyl+fi9nLCAnPGRlbD4kMTwvZGVsPicpO1xuICAgIHMgPSBzLnJlcGxhY2UoLyFcXFsoW15cXF1dKilcXF1cXCgoW14pXSspXFwpL2csICc8aW1nIHNyYz1cIiQyXCIgYWx0PVwiJDFcIiBzdHlsZT1cIm1heC13aWR0aDoxMDAlO2JvcmRlci1yYWRpdXM6NnB4O21hcmdpbjowLjVlbSAwXCI+Jyk7XG4gICAgcyA9IHMucmVwbGFjZSgvXFxbKFteXFxdXSspXFxdXFwoKFteKV0rKVxcKS9nLCAnPGEgaHJlZj1cIiQyXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXJcIiBzdHlsZT1cImNvbG9yOiM2MzY2ZjFcIj4kMTwvYT4nKTtcbiAgICBjb25zdCBzZWN0aW9ucyA9IHMuc3BsaXQoL1xcblxcbisvKTtcbiAgICBzID0gc2VjdGlvbnMubWFwKHNlYyA9PiB7XG4gICAgICAgIGNvbnN0IHQgPSBzZWMudHJpbSgpO1xuICAgICAgICBpZiAoIXQpXG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIGlmICgvXjwoaFsxLTZdfHVsfG9sfHByZXxibG9ja3F1b3RlfGhyfGltZykvLnRlc3QodCkgfHwgdC5zdGFydHNXaXRoKCdcXHgwMENCJykpXG4gICAgICAgICAgICByZXR1cm4gdDtcbiAgICAgICAgcmV0dXJuIGA8cCBzdHlsZT1cIm1hcmdpbjowLjVlbSAwO2xpbmUtaGVpZ2h0OjEuN1wiPiR7dC5yZXBsYWNlKC9cXG4vZywgJzxicj4nKX08L3A+YDtcbiAgICB9KS5qb2luKCdcXG4nKTtcbiAgICBzYXZlZC5mb3JFYWNoKChibGssIGkpID0+IHsgcyA9IHMucmVwbGFjZShgXFx4MDBDQiR7aX1cXHgwMGAsIGJsayk7IH0pO1xuICAgIHJldHVybiBzO1xufVxuY29uc3QgTWFya2Rvd25FZGl0b3IgPSAoeyBwcm9wZXJ0eSwgcmVjb3JkLCBvbkNoYW5nZSB9KSA9PiB7XG4gICAgY29uc3QgZmllbGRQYXRoID0gcHJvcGVydHkucGF0aDtcbiAgICBjb25zdCBpbml0aWFsVmFsdWUgPSByZWNvcmQ/LnBhcmFtcz8uW2ZpZWxkUGF0aF0gPz8gJyc7XG4gICAgY29uc3QgW3ZhbHVlLCBzZXRWYWx1ZV0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoaW5pdGlhbFZhbHVlKTtcbiAgICBjb25zdCBbcHJldmlldywgc2V0UHJldmlld10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoKCkgPT4gcmVuZGVyTWFya2Rvd24oaW5pdGlhbFZhbHVlKSk7XG4gICAgY29uc3QgW3VwbG9hZGluZywgc2V0VXBsb2FkaW5nXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShmYWxzZSk7XG4gICAgY29uc3QgW2FjdGl2ZVRhYiwgc2V0QWN0aXZlVGFiXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKSgnc3BsaXQnKTtcbiAgICBjb25zdCB0ZXh0YXJlYVJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgY29uc3QgZmlsZUlucHV0UmVmID0gKDAsIHJlYWN0XzEudXNlUmVmKShudWxsKTtcbiAgICBjb25zdCBkZWJvdW5jZVJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgKDAsIHJlYWN0XzEudXNlRWZmZWN0KSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHYgPSByZWNvcmQ/LnBhcmFtcz8uW2ZpZWxkUGF0aF0gPz8gJyc7XG4gICAgICAgIHNldFZhbHVlKHYpO1xuICAgICAgICBzZXRQcmV2aWV3KHJlbmRlck1hcmtkb3duKHYpKTtcbiAgICB9LCBbcmVjb3JkPy5pZF0pO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgoZSkgPT4ge1xuICAgICAgICBjb25zdCB2ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHNldFZhbHVlKHYpO1xuICAgICAgICBvbkNoYW5nZShmaWVsZFBhdGgsIHYpO1xuICAgICAgICBpZiAoZGVib3VuY2VSZWYuY3VycmVudClcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChkZWJvdW5jZVJlZi5jdXJyZW50KTtcbiAgICAgICAgZGVib3VuY2VSZWYuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4gc2V0UHJldmlldyhyZW5kZXJNYXJrZG93bih2KSksIDMwMCk7XG4gICAgfSwgW2ZpZWxkUGF0aCwgb25DaGFuZ2VdKTtcbiAgICBjb25zdCBpbnNlcnRBdEN1cnNvciA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgodGV4dCkgPT4ge1xuICAgICAgICBjb25zdCB0YSA9IHRleHRhcmVhUmVmLmN1cnJlbnQ7XG4gICAgICAgIGlmICghdGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gdGEuc2VsZWN0aW9uU3RhcnQgPz8gdmFsdWUubGVuZ3RoO1xuICAgICAgICBjb25zdCBlbmQgPSB0YS5zZWxlY3Rpb25FbmQgPz8gdmFsdWUubGVuZ3RoO1xuICAgICAgICBjb25zdCBuZXh0ID0gdmFsdWUuc2xpY2UoMCwgc3RhcnQpICsgdGV4dCArIHZhbHVlLnNsaWNlKGVuZCk7XG4gICAgICAgIHNldFZhbHVlKG5leHQpO1xuICAgICAgICBvbkNoYW5nZShmaWVsZFBhdGgsIG5leHQpO1xuICAgICAgICBzZXRQcmV2aWV3KHJlbmRlck1hcmtkb3duKG5leHQpKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0YS5zZWxlY3Rpb25TdGFydCA9IHRhLnNlbGVjdGlvbkVuZCA9IHN0YXJ0ICsgdGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB0YS5mb2N1cygpO1xuICAgICAgICB9LCAwKTtcbiAgICB9LCBbdmFsdWUsIGZpZWxkUGF0aCwgb25DaGFuZ2VdKTtcbiAgICBjb25zdCBoYW5kbGVVcGxvYWQgPSBhc3luYyAoZSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gZS50YXJnZXQuZmlsZXM/LlswXTtcbiAgICAgICAgaWYgKCFmaWxlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRVcGxvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICAgICAgZmQuYXBwZW5kKCdmaWxlJywgZmlsZSk7XG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnL3YxL3VwbG9hZCcsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGZkLCBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXMub2spXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzLnN0YXR1c31gKTtcbiAgICAgICAgICAgIGNvbnN0IHsgdXJsIH0gPSBhd2FpdCByZXMuanNvbigpO1xuICAgICAgICAgICAgaW5zZXJ0QXRDdXJzb3IoYCFbJHtmaWxlLm5hbWUucmVwbGFjZSgvXFwuW14uXSskLywgJycpfV0oJHt1cmx9KWApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGFsZXJ0KGBJbWFnZSB1cGxvYWQgZmFpbGVkOiAke2Vycj8ubWVzc2FnZSA/PyAndW5rbm93biBlcnJvcid9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRVcGxvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgaWYgKGZpbGVJbnB1dFJlZi5jdXJyZW50KVxuICAgICAgICAgICAgICAgIGZpbGVJbnB1dFJlZi5jdXJyZW50LnZhbHVlID0gJyc7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGVkaXRvclN0eWxlID0ge1xuICAgICAgICBmbGV4OiAxLCBmb250RmFtaWx5OiAnXCJGaXJhIENvZGVcIixcIkNhc2NhZGlhIENvZGVcIixcIkpldEJyYWlucyBNb25vXCIsbW9ub3NwYWNlJyxcbiAgICAgICAgZm9udFNpemU6ICcxM3B4JywgbGluZUhlaWdodDogJzEuNjUnLCBwYWRkaW5nOiAnMTJweCcsXG4gICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjMzM0MTU1JywgYm9yZGVyUmFkaXVzOiAnNnB4JywgcmVzaXplOiAnbm9uZScsXG4gICAgICAgIGJhY2tncm91bmQ6ICcjMGYxNzJhJywgY29sb3I6ICcjZTJlOGYwJywgbWluSGVpZ2h0OiAnNDYwcHgnLFxuICAgICAgICBib3hTaXppbmc6ICdib3JkZXItYm94Jywgb3ZlcmZsb3dZOiAnYXV0bycsXG4gICAgfTtcbiAgICBjb25zdCBwcmV2aWV3U3R5bGUgPSB7XG4gICAgICAgIGZsZXg6IDEsIHBhZGRpbmc6ICcxMnB4IDE2cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzMzNDE1NScsIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgIGJhY2tncm91bmQ6ICcjMGYxNzJhJywgY29sb3I6ICcjZTJlOGYwJywgbWluSGVpZ2h0OiAnNDYwcHgnLFxuICAgICAgICBvdmVyZmxvd1k6ICdhdXRvJywgZm9udFNpemU6ICcxNHB4JywgbGluZUhlaWdodDogJzEuNycsXG4gICAgICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgIH07XG4gICAgY29uc3QgdGFiQnRuID0gKGFjdGl2ZSkgPT4gKHtcbiAgICAgICAgcGFkZGluZzogJzVweCAxNHB4JywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICMzMzQxNTUnLCBib3JkZXJSYWRpdXM6ICc1cHgnLCBiYWNrZ3JvdW5kOiBhY3RpdmUgPyAnIzYzNjZmMScgOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICBjb2xvcjogYWN0aXZlID8gJyNmZmYnIDogJyM5NGEzYjgnLFxuICAgIH0pO1xuICAgIGNvbnN0IHNob3dFZGl0b3IgPSBhY3RpdmVUYWIgIT09ICdwcmV2aWV3JztcbiAgICBjb25zdCBzaG93UHJldmlldyA9IGFjdGl2ZVRhYiAhPT0gJ2VkaXRvcic7XG4gICAgcmV0dXJuIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzhweCcgfSB9LFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnNnB4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGZsZXhXcmFwOiAnd3JhcCcgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzRweCcgfSB9LCBbJ3NwbGl0JywgJ2VkaXRvcicsICdwcmV2aWV3J10ubWFwKHQgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsga2V5OiB0LCB0eXBlOiBcImJ1dHRvblwiLCBzdHlsZTogdGFiQnRuKGFjdGl2ZVRhYiA9PT0gdCksIG9uQ2xpY2s6ICgpID0+IHNldEFjdGl2ZVRhYih0KSB9LCB0ID09PSAnc3BsaXQnID8gJ+KKnyBTcGxpdCcgOiB0ID09PSAnZWRpdG9yJyA/ICfinI8gRWRpdG9yJyA6ICfwn5GBIFByZXZpZXcnKSkpKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZmxleDogMSB9IH0pLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdCJywgdGl0bGU6ICdCb2xkJywgaW5zZXJ0OiAnKipib2xkKionIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0knLCB0aXRsZTogJ0l0YWxpYycsIGluc2VydDogJyppdGFsaWMqJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIJywgdGl0bGU6ICdIZWFkaW5nJywgaW5zZXJ0OiAnIyMgSGVhZGluZ1xcbicgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnYCcsIHRpdGxlOiAnSW5saW5lIGNvZGUnLCBpbnNlcnQ6ICdgY29kZWAnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ+KJoScsIHRpdGxlOiAnQ29kZSBibG9jaycsIGluc2VydDogJ2BgYFxcbmNvZGVcXG5gYGBcXG4nIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ+KGkicsIHRpdGxlOiAnTGluaycsIGluc2VydDogJ1t0ZXh0XSh1cmwpJyB9LFxuICAgICAgICAgICAgXS5tYXAoKHsgbGFiZWwsIHRpdGxlLCBpbnNlcnQgfSkgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsga2V5OiBsYWJlbCwgdHlwZTogXCJidXR0b25cIiwgdGl0bGU6IHRpdGxlLCBvbkNsaWNrOiAoKSA9PiBpbnNlcnRBdEN1cnNvcihpbnNlcnQpLCBzdHlsZTogeyBwYWRkaW5nOiAnNHB4IDEwcHgnLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA3MDAsIGJvcmRlcjogJzFweCBzb2xpZCAjMzM0MTU1JywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JywgY29sb3I6ICcjOTRhM2I4JywgY3Vyc29yOiAncG9pbnRlcicgfSB9LCBsYWJlbCkpKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgZGlzYWJsZWQ6IHVwbG9hZGluZywgb25DbGljazogKCkgPT4gZmlsZUlucHV0UmVmLmN1cnJlbnQ/LmNsaWNrKCksIHN0eWxlOiB7IHBhZGRpbmc6ICc1cHggMTJweCcsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCwgYm9yZGVyOiAnMXB4IHNvbGlkICM2MzY2ZjEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiB1cGxvYWRpbmcgPyAnIzFlMjkzYicgOiAnIzYzNjZmMTIwJywgY29sb3I6ICcjODE4Y2Y4JywgY3Vyc29yOiB1cGxvYWRpbmcgPyAnbm90LWFsbG93ZWQnIDogJ3BvaW50ZXInIH0gfSwgdXBsb2FkaW5nID8gJ+KPsyBVcGxvYWRpbmfigKYnIDogJ/Cfk7cgSW1hZ2UnKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyByZWY6IGZpbGVJbnB1dFJlZiwgdHlwZTogXCJmaWxlXCIsIGFjY2VwdDogXCJpbWFnZS8qXCIsIHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9LCBvbkNoYW5nZTogaGFuZGxlVXBsb2FkIH0pKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzhweCcgfSB9LFxuICAgICAgICAgICAgc2hvd0VkaXRvciAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJ0ZXh0YXJlYVwiLCB7IHJlZjogdGV4dGFyZWFSZWYsIHZhbHVlOiB2YWx1ZSwgb25DaGFuZ2U6IGhhbmRsZUNoYW5nZSwgc3BlbGxDaGVjazogZmFsc2UsIHN0eWxlOiBlZGl0b3JTdHlsZSwgcGxhY2Vob2xkZXI6IFwiV3JpdGUgTWFya2Rvd24gaGVyZVxcdTIwMjZcIiB9KSksXG4gICAgICAgICAgICBzaG93UHJldmlldyAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogcHJldmlld1N0eWxlLCBkYW5nZXJvdXNseVNldElubmVySFRNTDogeyBfX2h0bWw6IHByZXZpZXcgfHwgJzxzcGFuIHN0eWxlPVwiY29sb3I6IzQ3NTU2OVwiPlByZXZpZXcgd2lsbCBhcHBlYXIgaGVyZeKApjwvc3Bhbj4nIH0gfSkpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNDc1NTY5JywgbWFyZ2luOiAwIH0gfSwgXCJHRk0gc3VwcG9ydGVkIFxcdTAwQjcgcHJldmlldyBkZWJvdW5jZWQgMzAwIG1zIFxcdTAwQjcgQ3RybCtaIHRvIHVuZG9cIikpKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBNYXJrZG93bkVkaXRvcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcmtkb3duLWVkaXRvci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3duS2V5cyA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICB2YXIgYXIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSkgYXJbYXIubGVuZ3RoXSA9IGs7XG4gICAgICAgICAgICByZXR1cm4gYXI7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvd25LZXlzKG8pO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtb2QpIHtcbiAgICAgICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgPSBvd25LZXlzKG1vZCksIGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykgaWYgKGtbaV0gIT09IFwiZGVmYXVsdFwiKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGtbaV0pO1xuICAgICAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcmVhY3RfMSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwicmVhY3RcIikpO1xuY29uc3QgYWRtaW5qc18xID0gcmVxdWlyZShcImFkbWluanNcIik7XG5jb25zdCBhcGkgPSBuZXcgYWRtaW5qc18xLkFwaUNsaWVudCgpO1xuY29uc3QgVGFnUGlja2VyID0gKHsgcHJvcGVydHksIHJlY29yZCwgb25DaGFuZ2UgfSkgPT4ge1xuICAgIGNvbnN0IFthbGxUYWdzLCBzZXRBbGxUYWdzXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShbXSk7XG4gICAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoW10pO1xuICAgIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKCcnKTtcbiAgICBjb25zdCBbc2hvd0Ryb3Bkb3duLCBzZXRTaG93RHJvcGRvd25dID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICBjb25zdCBpbnB1dFJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgKDAsIHJlYWN0XzEudXNlRWZmZWN0KSgoKSA9PiB7XG4gICAgICAgIGZldGNoKCcvdjEvYmxvZy90YWdzJywgeyBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pXG4gICAgICAgICAgICAudGhlbihyID0+IHIuanNvbigpKVxuICAgICAgICAgICAgLnRoZW4oKHRhZ3MpID0+IHNldEFsbFRhZ3ModGFncykpXG4gICAgICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gcmVjb3JkPy5wYXJhbXMgPz8ge307XG4gICAgICAgIGNvbnN0IGZyb21QYXJhbXMgPSBbXTtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICB3aGlsZSAocGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0uaWRgXSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBwYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS5pZGBdO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9Lm5hbWVgXTtcbiAgICAgICAgICAgIGlmIChpZCAmJiBuYW1lKVxuICAgICAgICAgICAgICAgIGZyb21QYXJhbXMucHVzaCh7IGlkLCBuYW1lIH0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvcHVsYXRlZCA9IHJlY29yZD8ucG9wdWxhdGVkPy5bcHJvcGVydHkucGF0aF0gPz8gW107XG4gICAgICAgIGNvbnN0IGZyb21Qb3B1bGF0ZWQgPSBwb3B1bGF0ZWRcbiAgICAgICAgICAgIC5tYXAoKHIpID0+ICh7IGlkOiByLnBhcmFtcz8uaWQsIG5hbWU6IHIucGFyYW1zPy5uYW1lIH0pKVxuICAgICAgICAgICAgLmZpbHRlcigodCkgPT4gdC5pZCAmJiB0Lm5hbWUpO1xuICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xuICAgICAgICBjb25zdCBtZXJnZWQgPSBbLi4uZnJvbVBhcmFtcywgLi4uZnJvbVBvcHVsYXRlZF0uZmlsdGVyKCh0KSA9PiAhc2Vlbi5oYXModC5pZCkgJiYgc2Vlbi5hZGQodC5pZCkpO1xuICAgICAgICBzZXRTZWxlY3RlZChtZXJnZWQpO1xuICAgIH0sIFtyZWNvcmQ/LmlkXSk7XG4gICAgY29uc3QgZW1pdCA9ICh0YWdzKSA9PiB7XG4gICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIHRhZ3MubGVuZ3RoID4gMCA/IHRhZ3MubWFwKHQgPT4gdC5pZCkgOiBbJ19fZW1wdHlfXyddKTtcbiAgICB9O1xuICAgIGNvbnN0IGFkZFRhZyA9ICh0YWcpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkLnNvbWUocyA9PiBzLmlkID09PSB0YWcuaWQpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBuZXh0ID0gWy4uLnNlbGVjdGVkLCB0YWddO1xuICAgICAgICBzZXRTZWxlY3RlZChuZXh0KTtcbiAgICAgICAgZW1pdChuZXh0KTtcbiAgICAgICAgc2V0UXVlcnkoJycpO1xuICAgICAgICBzZXRTaG93RHJvcGRvd24oZmFsc2UpO1xuICAgIH07XG4gICAgY29uc3QgcmVtb3ZlVGFnID0gKGlkKSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBzZWxlY3RlZC5maWx0ZXIodCA9PiB0LmlkICE9PSBpZCk7XG4gICAgICAgIHNldFNlbGVjdGVkKG5leHQpO1xuICAgICAgICBlbWl0KG5leHQpO1xuICAgIH07XG4gICAgY29uc3QgY3JlYXRlVGFnID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gcXVlcnkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhbGxUYWdzLmZpbmQodCA9PiB0Lm5hbWUgPT09IG5hbWUpO1xuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIGFkZFRhZyhleGlzdGluZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGFwaS5yZXNvdXJjZUFjdGlvbih7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VJZDogJ1RhZycsXG4gICAgICAgICAgICAgICAgYWN0aW9uTmFtZTogJ25ldycsXG4gICAgICAgICAgICAgICAgZGF0YTogeyBuYW1lIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHJlcy5kYXRhPy5yZWNvcmQ/LnBhcmFtcz8uaWQsXG4gICAgICAgICAgICAgICAgbmFtZTogcmVzLmRhdGE/LnJlY29yZD8ucGFyYW1zPy5uYW1lID8/IG5hbWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2V0QWxsVGFncyhwcmV2ID0+IFsuLi5wcmV2LCBjcmVhdGVkXS5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKSk7XG4gICAgICAgICAgICBhZGRUYWcoY3JlYXRlZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgYWxlcnQoYENvdWxkIG5vdCBjcmVhdGUgdGFnIFwiJHtuYW1lfVwiLiBQbGVhc2UgdHJ5IGFnYWluLmApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGFsbFRhZ3MuZmlsdGVyKHQgPT4gdC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkudG9Mb3dlckNhc2UoKSkgJiZcbiAgICAgICAgIXNlbGVjdGVkLnNvbWUocyA9PiBzLmlkID09PSB0LmlkKSk7XG4gICAgY29uc3QgY2hpcCA9IHtcbiAgICAgICAgZGlzcGxheTogJ2lubGluZS1mbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzRweCcsXG4gICAgICAgIHBhZGRpbmc6ICczcHggMTBweCcsIGJhY2tncm91bmRDb2xvcjogJyMzZDVhZjEnLCBjb2xvcjogJyNmZmYnLFxuICAgICAgICBib3JkZXJSYWRpdXM6ICcyMHB4JywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNTAwLFxuICAgIH07XG4gICAgY29uc3QgcmVtb3ZlQnRuID0ge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsIGJvcmRlcjogJ25vbmUnLCBjb2xvcjogJyNmZmYnLFxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJywgbGluZUhlaWdodDogMSwgcGFkZGluZzogJzAgMCAwIDJweCcsIGZvbnRTaXplOiAnMTRweCcsXG4gICAgfTtcbiAgICByZXR1cm4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScgfSB9LFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJywgZ2FwOiAnNnB4JywgbWFyZ2luQm90dG9tOiAnOHB4JywgbWluSGVpZ2h0OiAnMjhweCcgfSB9LCBzZWxlY3RlZC5tYXAodGFnID0+IChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBrZXk6IHRhZy5pZCwgc3R5bGU6IGNoaXAgfSxcbiAgICAgICAgICAgIHRhZy5uYW1lLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBzdHlsZTogcmVtb3ZlQnRuLCBvbkNsaWNrOiAoKSA9PiByZW1vdmVUYWcodGFnLmlkKSB9LCBcIlxcdTAwRDdcIikpKSkpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnNnB4JyB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgcmVmOiBpbnB1dFJlZiwgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBxdWVyeSwgb25DaGFuZ2U6IGUgPT4geyBzZXRRdWVyeShlLnRhcmdldC52YWx1ZSk7IHNldFNob3dEcm9wZG93bih0cnVlKTsgfSwgb25Gb2N1czogKCkgPT4gc2V0U2hvd0Ryb3Bkb3duKHRydWUpLCBvbkJsdXI6ICgpID0+IHNldFRpbWVvdXQoKCkgPT4gc2V0U2hvd0Ryb3Bkb3duKGZhbHNlKSwgMjAwKSwgb25LZXlEb3duOiBlID0+IHsgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlVGFnKCk7XG4gICAgICAgICAgICAgICAgfSB9LCBwbGFjZWhvbGRlcjogXCJTZWFyY2ggb3IgY3JlYXRlIGEgdGFnXFx1MjAyNlwiLCBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICBmbGV4OiAxLCBwYWRkaW5nOiAnN3B4IDExcHgnLCBib3JkZXI6ICcxcHggc29saWQgIzRhNGE2YScsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzVweCcsIGZvbnRTaXplOiAnMTNweCcsIGJhY2tncm91bmRDb2xvcjogJyMxYTFhMmUnLCBjb2xvcjogJyNlMGUwZTAnLFxuICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICBxdWVyeS50cmltKCkgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogY3JlYXRlVGFnLCBzdHlsZTogeyBwYWRkaW5nOiAnN3B4IDE0cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjMjJjNTVlJywgY29sb3I6ICcjZmZmJywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA1MDAgfSB9LCBcIisgQWRkXCIpKSksXG4gICAgICAgIHNob3dEcm9wZG93biAmJiBmaWx0ZXJlZC5sZW5ndGggPiAwICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInVsXCIsIHsgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnMTAwJScsIGxlZnQ6IDAsIHJpZ2h0OiAwLCB6SW5kZXg6IDk5OTksXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNXB4JyxcbiAgICAgICAgICAgICAgICBsaXN0U3R5bGU6ICdub25lJywgbWFyZ2luOiAnMnB4IDAnLCBwYWRkaW5nOiAwLCBtYXhIZWlnaHQ6ICcyMDBweCcsIG92ZXJmbG93WTogJ2F1dG8nLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgNHB4IDEycHggcmdiYSgwLDAsMCwwLjE1KScsXG4gICAgICAgICAgICB9IH0sIGZpbHRlcmVkLm1hcCh0YWcgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwibGlcIiwgeyBrZXk6IHRhZy5pZCwgb25Nb3VzZURvd246ICgpID0+IGFkZFRhZyh0YWcpLCBzdHlsZTogeyBwYWRkaW5nOiAnOHB4IDEycHgnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgY29sb3I6ICcjMzMzJyB9IH0sIHRhZy5uYW1lKSkpKSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwicFwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzg4OCcsIG1hcmdpbjogJzZweCAwIDAnIH0gfSwgXCJUeXBlIHRvIHNlYXJjaCBleGlzdGluZyB0YWdzIFxcdTAwQjcgcHJlc3MgRW50ZXIgb3IgY2xpY2sgXFxcIisgQWRkXFxcIiB0byBjcmVhdGUgbmV3XCIpKSk7XG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gVGFnUGlja2VyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGFnLXBpY2tlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3duS2V5cyA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICB2YXIgYXIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSkgYXJbYXIubGVuZ3RoXSA9IGs7XG4gICAgICAgICAgICByZXR1cm4gYXI7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvd25LZXlzKG8pO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtb2QpIHtcbiAgICAgICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgPSBvd25LZXlzKG1vZCksIGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykgaWYgKGtbaV0gIT09IFwiZGVmYXVsdFwiKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGtbaV0pO1xuICAgICAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gU2tpbGxQaWNrZXI7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5mdW5jdGlvbiBTa2lsbFBpY2tlcih7IHByb3BlcnR5LCByZWNvcmQsIG9uQ2hhbmdlIH0pIHtcbiAgICBjb25zdCBbc2tpbGxzLCBzZXRTa2lsbHNdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKFtdKTtcbiAgICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKSgnJyk7XG4gICAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoW10pO1xuICAgIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShmYWxzZSk7XG4gICAgKDAsIHJlYWN0XzEudXNlRWZmZWN0KSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkcyA9IFtdO1xuICAgICAgICBPYmplY3QuZW50cmllcyhyZWNvcmQucGFyYW1zID8/IHt9KS5mb3JFYWNoKChba2V5LCB2YWxdKSA9PiB7XG4gICAgICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoYCR7cHJvcGVydHkucGF0aH0uYCkgJiYga2V5LmVuZHNXaXRoKCcuaWQnKSkge1xuICAgICAgICAgICAgICAgIGlkcy5wdXNoKHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBwb3B1bGF0ZWQgPSAocmVjb3JkLnBvcHVsYXRlZCA/PyB7fSlbcHJvcGVydHkucGF0aF07XG4gICAgICAgIGlmIChwb3B1bGF0ZWQpIHtcbiAgICAgICAgICAgIGlkcy5wdXNoKC4uLnBvcHVsYXRlZC5tYXAoKHMpID0+IHMucGFyYW1zPy5pZCA/PyBzLmlkKS5maWx0ZXIoQm9vbGVhbikpO1xuICAgICAgICB9XG4gICAgICAgIHNldFNlbGVjdGVkKFsuLi5uZXcgU2V0KGlkcyldKTtcbiAgICB9LCBbXSk7XG4gICAgKDAsIHJlYWN0XzEudXNlRWZmZWN0KSgoKSA9PiB7XG4gICAgICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgICAgIGNvbnN0IGJhc2UgPSB3aW5kb3cuX19BUElfQkFTRV9fXG4gICAgICAgICAgICA/PyBgJHt3aW5kb3cubG9jYXRpb24ucHJvdG9jb2x9Ly8ke3dpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZX06MzAwMWA7XG4gICAgICAgIGZldGNoKGAke2Jhc2V9L3YxL3Jlc3VtZWApXG4gICAgICAgICAgICAudGhlbigocikgPT4gci5qc29uKCkpXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4gc2V0U2tpbGxzKGRhdGE/LnNraWxscyA/PyBbXSkpXG4gICAgICAgICAgICAuY2F0Y2goKCkgPT4geyB9KVxuICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4gc2V0TG9hZGluZyhmYWxzZSkpO1xuICAgIH0sIFtdKTtcbiAgICBjb25zdCB0b2dnbGUgPSAoMCwgcmVhY3RfMS51c2VDYWxsYmFjaykoKGlkKSA9PiB7XG4gICAgICAgIHNldFNlbGVjdGVkKChwcmV2KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gcHJldi5pbmNsdWRlcyhpZCkgPyBwcmV2LmZpbHRlcigoeCkgPT4geCAhPT0gaWQpIDogWy4uLnByZXYsIGlkXTtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIG5leHQubGVuZ3RoID4gMCA/IG5leHQgOiBbJ19fZW1wdHlfXyddKTtcbiAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9KTtcbiAgICB9LCBbb25DaGFuZ2UsIHByb3BlcnR5LnBhdGhdKTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IHF1ZXJ5XG4gICAgICAgID8gc2tpbGxzLmZpbHRlcigocykgPT4gcy5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkudG9Mb3dlckNhc2UoKSkpXG4gICAgICAgIDogc2tpbGxzO1xuICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBbLi4ubmV3IFNldChmaWx0ZXJlZC5tYXAoKHMpID0+IHMuY2F0ZWdvcnkpKV0uc29ydCgpO1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDggfSB9LFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBsZXR0ZXJTcGFjaW5nOiAxLCBvcGFjaXR5OiAwLjcgfSB9LCBwcm9wZXJ0eS5sYWJlbCksXG4gICAgICAgIHNlbGVjdGVkLmxlbmd0aCA+IDAgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6IDQgfSB9LCBzZWxlY3RlZC5tYXAoKGlkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzayA9IHNraWxscy5maW5kKChzKSA9PiBzLmlkID09PSBpZCk7XG4gICAgICAgICAgICByZXR1cm4gc2sgPyAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHsga2V5OiBpZCwgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzJweCA4cHgnLCBib3JkZXJSYWRpdXM6IDQsIGZvbnRTaXplOiAxMSwgZm9udFdlaWdodDogNTAwLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSg5OSwxMDIsMjQxLDAuMTUpJywgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoOTksMTAyLDI0MSwwLjM1KScsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogNCwgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgICAgICAgICAgfSwgb25DbGljazogKCkgPT4gdG9nZ2xlKGlkKSB9LFxuICAgICAgICAgICAgICAgIHNrLm5hbWUsXG4gICAgICAgICAgICAgICAgXCIgXFx1MjcxNVwiKSkgOiBudWxsO1xuICAgICAgICB9KSkpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIkZpbHRlciBza2lsbHMuLi5cIiwgdmFsdWU6IHF1ZXJ5LCBvbkNoYW5nZTogKGUpID0+IHNldFF1ZXJ5KGUudGFyZ2V0LnZhbHVlKSwgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnNnB4IDEwcHgnLCBib3JkZXJSYWRpdXM6IDYsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMTI4LDEyOCwxMjgsMC4zKScsIGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDEzLCBjb2xvcjogJ2luaGVyaXQnLCBib3hTaXppbmc6ICdib3JkZXItYm94JyxcbiAgICAgICAgICAgIH0gfSksXG4gICAgICAgIGxvYWRpbmcgJiYgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEyLCBvcGFjaXR5OiAwLjYgfSB9LCBcIkxvYWRpbmcgc2tpbGxzXFx1MjAyNlwiKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBtYXhIZWlnaHQ6IDIyMCwgb3ZlcmZsb3dZOiAnYXV0bycsIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDEyOCwxMjgsMTI4LDAuMiknLCBib3JkZXJSYWRpdXM6IDYsIHBhZGRpbmc6IDggfSB9LFxuICAgICAgICAgICAgY2F0ZWdvcmllcy5tYXAoKGNhdCkgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsga2V5OiBjYXQsIHN0eWxlOiB7IG1hcmdpbkJvdHRvbTogMTAgfSB9LFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEwLCBmb250V2VpZ2h0OiA3MDAsIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBsZXR0ZXJTcGFjaW5nOiAxLCBvcGFjaXR5OiAwLjUsIG1hcmdpbkJvdHRvbTogNCB9IH0sIGNhdCksXG4gICAgICAgICAgICAgICAgZmlsdGVyZWQuZmlsdGVyKChzKSA9PiBzLmNhdGVnb3J5ID09PSBjYXQpLm1hcCgoc2tpbGwpID0+IChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIsIHsga2V5OiBza2lsbC5pZCwgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiA2LCBmb250U2l6ZTogMTMsIGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMnB4IDAnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogc2VsZWN0ZWQuaW5jbHVkZXMoc2tpbGwuaWQpLCBvbkNoYW5nZTogKCkgPT4gdG9nZ2xlKHNraWxsLmlkKSwgc3R5bGU6IHsgd2lkdGg6IDE0LCBoZWlnaHQ6IDE0IH0gfSksXG4gICAgICAgICAgICAgICAgICAgIHNraWxsLm5hbWUpKSkpKSksXG4gICAgICAgICAgICBmaWx0ZXJlZC5sZW5ndGggPT09IDAgJiYgIWxvYWRpbmcgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMiwgb3BhY2l0eTogMC41IH0gfSwgXCJObyBza2lsbHMgZm91bmQuXCIpKSkpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNraWxsLXBpY2tlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3duS2V5cyA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICB2YXIgYXIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSkgYXJbYXIubGVuZ3RoXSA9IGs7XG4gICAgICAgICAgICByZXR1cm4gYXI7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvd25LZXlzKG8pO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtb2QpIHtcbiAgICAgICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgPSBvd25LZXlzKG1vZCksIGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykgaWYgKGtbaV0gIT09IFwiZGVmYXVsdFwiKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGtbaV0pO1xuICAgICAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gTWVkaWFVcGxvYWRlcjtcbmNvbnN0IHJlYWN0XzEgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInJlYWN0XCIpKTtcbmZ1bmN0aW9uIE1lZGlhVXBsb2FkZXIoeyBwcm9wZXJ0eSwgcmVjb3JkLCBvbkNoYW5nZSB9KSB7XG4gICAgY29uc3QgYXBpQmFzZSA9IHdpbmRvdy5fX0FQSV9CQVNFX19cbiAgICAgICAgPz8gYCR7d2luZG93LmxvY2F0aW9uLnByb3RvY29sfS8vJHt3aW5kb3cubG9jYXRpb24uaG9zdG5hbWV9OjMwMDFgO1xuICAgIGNvbnN0IGluaXRpYWwgPSBbXTtcbiAgICBpZiAocmVjb3JkPy5wYXJhbXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICB3aGlsZSAocmVjb3JkLnBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LnVybGBdKSB7XG4gICAgICAgICAgICBpbml0aWFsLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiByZWNvcmQucGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0uaWRgXSA/PyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdXJsOiByZWNvcmQucGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0udXJsYF0sXG4gICAgICAgICAgICAgICAgYWx0VGV4dDogcmVjb3JkLnBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LmFsdFRleHRgXSA/PyAnJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IFtpdGVtcywgc2V0SXRlbXNdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGluaXRpYWwpO1xuICAgIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICBjb25zdCBkcmFnSWR4ID0gKDAsIHJlYWN0XzEudXNlUmVmKShudWxsKTtcbiAgICBjb25zdCBmaWxlUmVmID0gKDAsIHJlYWN0XzEudXNlUmVmKShudWxsKTtcbiAgICBjb25zdCBlbWl0ID0gKDAsIHJlYWN0XzEudXNlQ2FsbGJhY2spKChuZXh0KSA9PiB7XG4gICAgICAgIHNldEl0ZW1zKG5leHQpO1xuICAgICAgICBvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCBuZXh0LmZpbHRlcigobSkgPT4gIW0udXBsb2FkaW5nICYmICFtLmVycm9yKSk7XG4gICAgfSwgW29uQ2hhbmdlLCBwcm9wZXJ0eS5wYXRoXSk7XG4gICAgY29uc3QgdXBsb2FkRmlsZXMgPSBhc3luYyAoZmlsZXMpID0+IHtcbiAgICAgICAgaWYgKCFmaWxlcyB8fCAhZmlsZXMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBwbGFjZWhvbGRlcnMgPSBBcnJheS5mcm9tKGZpbGVzKS5tYXAoKGYpID0+ICh7XG4gICAgICAgICAgICB1cmw6IFVSTC5jcmVhdGVPYmplY3RVUkwoZiksIGFsdFRleHQ6ICcnLCB1cGxvYWRpbmc6IHRydWUsXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2V0SXRlbXMoKHByZXYpID0+IFsuLi5wcmV2LCAuLi5wbGFjZWhvbGRlcnNdKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGZpbGVzW2ldO1xuICAgICAgICAgICAgY29uc3QgZmQgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgICAgIGZkLmFwcGVuZCgnZmlsZScsIGZpbGUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlfS92MS91cGxvYWRgLCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLCBib2R5OiBmZCwgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlcy5vaylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVcGxvYWQgZmFpbGVkOiAke3Jlcy5zdGF0dXN9YCk7XG4gICAgICAgICAgICAgICAgY29uc3QgeyB1cmwgfSA9IGF3YWl0IHJlcy5qc29uKCk7XG4gICAgICAgICAgICAgICAgc2V0SXRlbXMoKHByZXYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IFsuLi5wcmV2XTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gbmV4dC5maW5kSW5kZXgoKG0pID0+IG0udXBsb2FkaW5nICYmIG0udXJsID09PSBwbGFjZWhvbGRlcnNbaV0udXJsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkeCAhPT0gLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0W2lkeF0gPSB7IHVybCwgYWx0VGV4dDogJycsIHVwbG9hZGluZzogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV4dC5maWx0ZXIoKG0pID0+ICFtLnVwbG9hZGluZykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBzZXRJdGVtcygocHJldikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gWy4uLnByZXZdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBuZXh0LmZpbmRJbmRleCgobSkgPT4gbS51cGxvYWRpbmcgJiYgbS51cmwgPT09IHBsYWNlaG9sZGVyc1tpXS51cmwpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWR4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRbaWR4XSA9IHsgLi4ubmV4dFtpZHhdLCB1cGxvYWRpbmc6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IG9uRHJhZ1N0YXJ0ID0gKGkpID0+IHsgZHJhZ0lkeC5jdXJyZW50ID0gaTsgfTtcbiAgICBjb25zdCBvbkRyYWdPdmVyID0gKGUsIGkpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoZHJhZ0lkeC5jdXJyZW50ID09PSBudWxsIHx8IGRyYWdJZHguY3VycmVudCA9PT0gaSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0SXRlbXMoKHByZXYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBbLi4ucHJldl07XG4gICAgICAgICAgICBjb25zdCBbbW92ZWRdID0gbmV4dC5zcGxpY2UoZHJhZ0lkeC5jdXJyZW50LCAxKTtcbiAgICAgICAgICAgIG5leHQuc3BsaWNlKGksIDAsIG1vdmVkKTtcbiAgICAgICAgICAgIGRyYWdJZHguY3VycmVudCA9IGk7XG4gICAgICAgICAgICBvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCBuZXh0LmZpbHRlcigobSkgPT4gIW0udXBsb2FkaW5nKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBjb25zdCBvbkRyb3Bab25lID0gKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzZXREcmFnZ2luZyhmYWxzZSk7XG4gICAgICAgIHVwbG9hZEZpbGVzKGUuZGF0YVRyYW5zZmVyLmZpbGVzKTtcbiAgICB9O1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDEyIH0gfSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBvbkRyYWdPdmVyOiAoZSkgPT4geyBlLnByZXZlbnREZWZhdWx0KCk7IHNldERyYWdnaW5nKHRydWUpOyB9LCBvbkRyYWdMZWF2ZTogKCkgPT4gc2V0RHJhZ2dpbmcoZmFsc2UpLCBvbkRyb3A6IG9uRHJvcFpvbmUsIG9uQ2xpY2s6ICgpID0+IGZpbGVSZWYuY3VycmVudD8uY2xpY2soKSwgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICBib3JkZXI6IGAycHggZGFzaGVkICR7ZHJhZ2dpbmcgPyAnIzgxOGNmOCcgOiAncmdiYSgxMjgsMTI4LDEyOCwwLjMpJ31gLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogOCwgcGFkZGluZzogJzI0cHggMTZweCcsIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsIGJhY2tncm91bmQ6IGRyYWdnaW5nID8gJ3JnYmEoOTksMTAyLDI0MSwwLjA1KScgOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdhbGwgMTUwbXMnLFxuICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzLCBvcGFjaXR5OiAwLjcgfSB9LFxuICAgICAgICAgICAgICAgIFwiRHJvcCBpbWFnZXMgaGVyZSBvciBcIixcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInN0cm9uZ1wiLCBudWxsLCBcImNsaWNrIHRvIGJyb3dzZVwiKSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgcmVmOiBmaWxlUmVmLCB0eXBlOiBcImZpbGVcIiwgbXVsdGlwbGU6IHRydWUsIGFjY2VwdDogXCJpbWFnZS8qXCIsIHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9LCBvbkNoYW5nZTogKGUpID0+IHVwbG9hZEZpbGVzKGUudGFyZ2V0LmZpbGVzKSB9KSksXG4gICAgICAgIGl0ZW1zLmxlbmd0aCA+IDAgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2dyaWQnLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZmlsbCwgbWlubWF4KDEyMHB4LCAxZnIpKScsIGdhcDogOCB9IH0sIGl0ZW1zLm1hcCgoaXRlbSwgaSkgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsga2V5OiBpLCBkcmFnZ2FibGU6ICFpdGVtLnVwbG9hZGluZywgb25EcmFnU3RhcnQ6ICgpID0+IG9uRHJhZ1N0YXJ0KGkpLCBvbkRyYWdPdmVyOiAoZSkgPT4gb25EcmFnT3ZlcihlLCBpKSwgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJywgYm9yZGVyUmFkaXVzOiA4LCBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMTI4LDEyOCwxMjgsMC4yKScsIGN1cnNvcjogaXRlbS51cGxvYWRpbmcgPyAnZGVmYXVsdCcgOiAnZ3JhYicsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogaXRlbS51cGxvYWRpbmcgPyAwLjYgOiAxLFxuICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiwgeyBzcmM6IGl0ZW0udXJsLCBhbHQ6IGl0ZW0uYWx0VGV4dCwgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiA4MCwgb2JqZWN0Rml0OiAnY292ZXInLCBkaXNwbGF5OiAnYmxvY2snIH0gfSksXG4gICAgICAgICAgICBpdGVtLnVwbG9hZGluZyAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgaW5zZXQ6IDAsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgYmFja2dyb3VuZDogJ3JnYmEoMCwwLDAsMC40KScsIGZvbnRTaXplOiAxMCwgY29sb3I6ICcjZmZmJyB9IH0sIFwiVXBsb2FkaW5nXFx1MjAyNlwiKSksXG4gICAgICAgICAgICBpdGVtLmVycm9yICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBpbnNldDogMCwgYmFja2dyb3VuZDogJ3JnYmEoMjIwLDM4LDM4LDAuNyknLCBmb250U2l6ZTogOSwgY29sb3I6ICcjZmZmJywgcGFkZGluZzogNCwgb3ZlcmZsb3c6ICdoaWRkZW4nIH0gfSwgaXRlbS5lcnJvcikpLFxuICAgICAgICAgICAgIWl0ZW0udXBsb2FkaW5nICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChyZWFjdF8xLmRlZmF1bHQuRnJhZ21lbnQsIG51bGwsXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCBwbGFjZWhvbGRlcjogXCJBbHQgdGV4dFwiLCB2YWx1ZTogaXRlbS5hbHRUZXh0LCBvbkNoYW5nZTogKGUpID0+IGVtaXQoaXRlbXMubWFwKChpdCwgaikgPT4gaiA9PT0gaSA/IHsgLi4uaXQsIGFsdFRleHQ6IGUudGFyZ2V0LnZhbHVlIH0gOiBpdCkpLCBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBmb250U2l6ZTogMTAsIHBhZGRpbmc6ICczcHggNnB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclRvcDogJzFweCBzb2xpZCByZ2JhKDEyOCwxMjgsMTI4LDAuMiknLCBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnLCBib3hTaXppbmc6ICdib3JkZXItYm94JyB9IH0pLFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gZW1pdChpdGVtcy5maWx0ZXIoKF8sIGopID0+IGogIT09IGkpKSwgc3R5bGU6IHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogNCwgcmlnaHQ6IDQsIGJhY2tncm91bmQ6ICdyZ2JhKDIyMCwzOCwzOCwwLjgpJywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogNCwgY29sb3I6ICcjZmZmJywgZm9udFNpemU6IDEwLCBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzFweCA1cHgnIH0sIHRpdGxlOiBcIlJlbW92ZVwiIH0sIFwiXFx1MjcxNVwiKSkpKSkpKSkpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lZGlhLXVwbG9hZGVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBWaWRlb01hbmFnZXI7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5mdW5jdGlvbiBkZXRlY3RTb3VyY2UodXJsKSB7XG4gICAgaWYgKC95b3V0dShcXC5iZXxiZVxcLmNvbSkvaS50ZXN0KHVybCkpXG4gICAgICAgIHJldHVybiAneW91dHViZSc7XG4gICAgaWYgKC92aW1lb1xcLmNvbS9pLnRlc3QodXJsKSlcbiAgICAgICAgcmV0dXJuICd2aW1lbyc7XG4gICAgcmV0dXJuICdzZWxmX2hvc3RlZCc7XG59XG5mdW5jdGlvbiBWaWRlb01hbmFnZXIoeyBwcm9wZXJ0eSwgcmVjb3JkLCBvbkNoYW5nZSB9KSB7XG4gICAgY29uc3QgaW5pdGlhbCA9IFtdO1xuICAgIGlmIChyZWNvcmQ/LnBhcmFtcykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlIChyZWNvcmQucGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0udXJsYF0pIHtcbiAgICAgICAgICAgIGluaXRpYWwucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IHJlY29yZC5wYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS5pZGBdID8/IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IChyZWNvcmQucGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0uc291cmNlYF0gPz8gJ3NlbGZfaG9zdGVkJyksXG4gICAgICAgICAgICAgICAgdXJsOiByZWNvcmQucGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0udXJsYF0sXG4gICAgICAgICAgICAgICAgdGl0bGU6IHJlY29yZC5wYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS50aXRsZWBdID8/ICcnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgW2l0ZW1zLCBzZXRJdGVtc10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoaW5pdGlhbCk7XG4gICAgY29uc3QgW25ld1VybCwgc2V0TmV3VXJsXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKSgnJyk7XG4gICAgY29uc3QgW25ld1RpdGxlLCBzZXROZXdUaXRsZV0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoJycpO1xuICAgIGNvbnN0IGRyYWdJZHggPSAoMCwgcmVhY3RfMS51c2VSZWYpKG51bGwpO1xuICAgIGNvbnN0IGVtaXQgPSAoMCwgcmVhY3RfMS51c2VDYWxsYmFjaykoKG5leHQpID0+IHtcbiAgICAgICAgc2V0SXRlbXMobmV4dCk7XG4gICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIG5leHQpO1xuICAgIH0sIFtvbkNoYW5nZSwgcHJvcGVydHkucGF0aF0pO1xuICAgIGNvbnN0IGFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IG5ld1VybC50cmltKCk7XG4gICAgICAgIGlmICghdXJsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBpdGVtID0geyBzb3VyY2U6IGRldGVjdFNvdXJjZSh1cmwpLCB1cmwsIHRpdGxlOiBuZXdUaXRsZS50cmltKCkgfTtcbiAgICAgICAgZW1pdChbLi4uaXRlbXMsIGl0ZW1dKTtcbiAgICAgICAgc2V0TmV3VXJsKCcnKTtcbiAgICAgICAgc2V0TmV3VGl0bGUoJycpO1xuICAgIH07XG4gICAgY29uc3Qgb25EcmFnU3RhcnQgPSAoaSkgPT4geyBkcmFnSWR4LmN1cnJlbnQgPSBpOyB9O1xuICAgIGNvbnN0IG9uRHJhZ092ZXIgPSAoZSwgaSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChkcmFnSWR4LmN1cnJlbnQgPT09IG51bGwgfHwgZHJhZ0lkeC5jdXJyZW50ID09PSBpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBuZXh0ID0gWy4uLml0ZW1zXTtcbiAgICAgICAgY29uc3QgW21vdmVkXSA9IG5leHQuc3BsaWNlKGRyYWdJZHguY3VycmVudCwgMSk7XG4gICAgICAgIG5leHQuc3BsaWNlKGksIDAsIG1vdmVkKTtcbiAgICAgICAgZHJhZ0lkeC5jdXJyZW50ID0gaTtcbiAgICAgICAgZW1pdChuZXh0KTtcbiAgICB9O1xuICAgIGNvbnN0IGxhYmVsU3R5bGUgPSB7XG4gICAgICAgIGZvbnRTaXplOiAxMCwgZm9udFdlaWdodDogNzAwLCB0ZXh0VHJhbnNmb3JtOiAndXBwZXJjYXNlJywgbGV0dGVyU3BhY2luZzogMSwgb3BhY2l0eTogMC41LCBtYXJnaW5Cb3R0b206IDQsXG4gICAgfTtcbiAgICBjb25zdCBpbnB1dFN0eWxlID0ge1xuICAgICAgICB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnNnB4IDEwcHgnLCBib3JkZXJSYWRpdXM6IDYsIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDEyOCwxMjgsMTI4LDAuMyknLFxuICAgICAgICBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnLCBmb250U2l6ZTogMTMsIGNvbG9yOiAnaW5oZXJpdCcsIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgIH07XG4gICAgcmV0dXJuIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTIgfSB9LFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAsIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBsZXR0ZXJTcGFjaW5nOiAxLCBvcGFjaXR5OiAwLjcgfSB9LCBwcm9wZXJ0eS5wYXRoLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcGVydHkucGF0aC5zbGljZSgxKSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiA2LCBwYWRkaW5nOiAxMiwgYm9yZGVyUmFkaXVzOiA4LCBib3JkZXI6ICcxcHggc29saWQgcmdiYSgxMjgsMTI4LDEyOCwwLjIpJyB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiBsYWJlbFN0eWxlIH0sIFwiQWRkIHZpZGVvXCIpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHR5cGU6IFwidXJsXCIsIHBsYWNlaG9sZGVyOiBcIllvdVR1YmUsIFZpbWVvLCBvciBNUDQgVVJMXCIsIHZhbHVlOiBuZXdVcmwsIG9uQ2hhbmdlOiAoZSkgPT4gc2V0TmV3VXJsKGUudGFyZ2V0LnZhbHVlKSwgb25LZXlEb3duOiAoZSkgPT4gZS5rZXkgPT09ICdFbnRlcicgJiYgYWRkSXRlbSgpLCBzdHlsZTogaW5wdXRTdHlsZSB9KSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiVGl0bGUgKG9wdGlvbmFsKVwiLCB2YWx1ZTogbmV3VGl0bGUsIG9uQ2hhbmdlOiAoZSkgPT4gc2V0TmV3VGl0bGUoZS50YXJnZXQudmFsdWUpLCBvbktleURvd246IChlKSA9PiBlLmtleSA9PT0gJ0VudGVyJyAmJiBhZGRJdGVtKCksIHN0eWxlOiBpbnB1dFN0eWxlIH0pLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyBvbkNsaWNrOiBhZGRJdGVtLCBzdHlsZTogeyBhbGlnblNlbGY6ICdmbGV4LXN0YXJ0JywgcGFkZGluZzogJzZweCAxNHB4JywgYm9yZGVyUmFkaXVzOiA2LCBib3JkZXI6ICdub25lJywgY3Vyc29yOiAncG9pbnRlcicsIGJhY2tncm91bmQ6ICcjNjM2NmYxJywgY29sb3I6ICcjZmZmJywgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAgfSB9LCBcIisgQWRkXCIpKSxcbiAgICAgICAgaXRlbXMubGVuZ3RoID4gMCAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDYgfSB9LCBpdGVtcy5tYXAoKGl0ZW0sIGkpID0+IChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IGtleTogaSwgZHJhZ2dhYmxlOiB0cnVlLCBvbkRyYWdTdGFydDogKCkgPT4gb25EcmFnU3RhcnQoaSksIG9uRHJhZ092ZXI6IChlKSA9PiBvbkRyYWdPdmVyKGUsIGkpLCBzdHlsZToge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogOCxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDEwcHgnLCBib3JkZXJSYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMTI4LDEyOCwxMjgsMC4yKScsXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnZ3JhYicsXG4gICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogOSwgcGFkZGluZzogJzJweCA2cHgnLCBib3JkZXJSYWRpdXM6IDQsIGZvbnRXZWlnaHQ6IDcwMCxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogaXRlbS5zb3VyY2UgPT09ICd5b3V0dWJlJyA/ICdyZ2JhKDIyMCwzOCwzOCwwLjE1KSdcbiAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5zb3VyY2UgPT09ICd2aW1lbycgPyAncmdiYSgxNCwxNjUsMjMzLDAuMTUpJyA6ICdyZ2JhKDk5LDEwMiwyNDEsMC4xNSknLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogaXRlbS5zb3VyY2UgPT09ICd5b3V0dWJlJyA/ICcjZGMyNjI2J1xuICAgICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLnNvdXJjZSA9PT0gJ3ZpbWVvJyA/ICcjMGVhNWU5JyA6ICcjNjM2NmYxJyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsIGxldHRlclNwYWNpbmc6IDEsIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgICAgICAgfSB9LCBpdGVtLnNvdXJjZS5yZXBsYWNlKCdfJywgJyAnKSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGZsZXg6IDEsIG92ZXJmbG93OiAnaGlkZGVuJyB9IH0sXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDUwMCwgd2hpdGVTcGFjZTogJ25vd3JhcCcsIG92ZXJmbG93OiAnaGlkZGVuJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnIH0gfSwgaXRlbS50aXRsZSB8fCBpdGVtLnVybCksXG4gICAgICAgICAgICAgICAgaXRlbS50aXRsZSAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTAsIG9wYWNpdHk6IDAuNSwgd2hpdGVTcGFjZTogJ25vd3JhcCcsIG92ZXJmbG93OiAnaGlkZGVuJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnIH0gfSwgaXRlbS51cmwpKSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIlRpdGxlXCIsIHZhbHVlOiBpdGVtLnRpdGxlLCBvbkNoYW5nZTogKGUpID0+IGVtaXQoaXRlbXMubWFwKChpdCwgaikgPT4gaiA9PT0gaSA/IHsgLi4uaXQsIHRpdGxlOiBlLnRhcmdldC52YWx1ZSB9IDogaXQpKSwgc3R5bGU6IHsgLi4uaW5wdXRTdHlsZSwgd2lkdGg6IDEyMCwgZmxleFNocmluazogMCB9IH0pLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyBvbkNsaWNrOiAoKSA9PiBlbWl0KGl0ZW1zLmZpbHRlcigoXywgaikgPT4gaiAhPT0gaSkpLCBzdHlsZTogeyBmbGV4U2hyaW5rOiAwLCBiYWNrZ3JvdW5kOiAncmdiYSgyMjAsMzgsMzgsMC4xNSknLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiA0LCBjb2xvcjogJyNkYzI2MjYnLCBmb250U2l6ZTogMTEsIGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnM3B4IDdweCcgfSB9LCBcIlxcdTI3MTVcIiksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBzdHlsZTogeyBmbGV4U2hyaW5rOiAwLCBvcGFjaXR5OiAwLjMsIGZvbnRTaXplOiAxNCwgY3Vyc29yOiAnZ3JhYicgfSB9LCBcIlxcdTI4M0ZcIikpKSkpKSkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dmlkZW8tbWFuYWdlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3duS2V5cyA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICB2YXIgYXIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSkgYXJbYXIubGVuZ3RoXSA9IGs7XG4gICAgICAgICAgICByZXR1cm4gYXI7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvd25LZXlzKG8pO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtb2QpIHtcbiAgICAgICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgPSBvd25LZXlzKG1vZCksIGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykgaWYgKGtbaV0gIT09IFwiZGVmYXVsdFwiKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGtbaV0pO1xuICAgICAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gUGhvdG9VcGxvYWRlcjtcbmNvbnN0IHJlYWN0XzEgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInJlYWN0XCIpKTtcbmZ1bmN0aW9uIFBob3RvVXBsb2FkZXIoeyBwcm9wZXJ0eSwgcmVjb3JkLCBvbkNoYW5nZSB9KSB7XG4gICAgY29uc3QgYXBpQmFzZSA9IHdpbmRvdy5fX0FQSV9CQVNFX19cbiAgICAgICAgPz8gYCR7d2luZG93LmxvY2F0aW9uLnByb3RvY29sfS8vJHt3aW5kb3cubG9jYXRpb24uaG9zdG5hbWV9OjMwMDFgO1xuICAgIGNvbnN0IGV4aXN0aW5nVXJsID0gcmVjb3JkPy5wYXJhbXM/Lltwcm9wZXJ0eS5wYXRoXSA/PyAnJztcbiAgICBjb25zdCBbaXRlbXMsIHNldEl0ZW1zXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShbXSk7XG4gICAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoZmFsc2UpO1xuICAgIGNvbnN0IGZpbGVSZWYgPSAoMCwgcmVhY3RfMS51c2VSZWYpKG51bGwpO1xuICAgIGNvbnN0IHVwZGF0ZSA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgoaWR4LCBwYXRjaCkgPT4gc2V0SXRlbXMocHJldiA9PiBwcmV2Lm1hcCgoaXQsIGkpID0+IGkgPT09IGlkeCA/IHsgLi4uaXQsIC4uLnBhdGNoIH0gOiBpdCkpLCBbXSk7XG4gICAgY29uc3QgdXBsb2FkT25lID0gKDAsIHJlYWN0XzEudXNlQ2FsbGJhY2spKGFzeW5jIChpdGVtLCBpZHgpID0+IHtcbiAgICAgICAgdXBkYXRlKGlkeCwgeyBzdGF0ZTogJ3VwbG9hZGluZycsIHByb2dyZXNzOiAwIH0pO1xuICAgICAgICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICBmZC5hcHBlbmQoJ2ZpbGUnLCBpdGVtLmZpbGUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGUoaWR4LCB7IHByb2dyZXNzOiBNYXRoLnJvdW5kKChlLmxvYWRlZCAvIGUudG90YWwpICogOTApIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZShpZHgsIHsgc3RhdGU6ICdkb25lJywgcHJvZ3Jlc3M6IDEwMCwgcmVzdWx0VXJsOiBkYXRhLm9yaWdpbmFsVXJsIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIGRhdGEub3JpZ2luYWxVcmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdJbnZhbGlkIEpTT04gcmVzcG9uc2UnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBVcGxvYWQgZmFpbGVkOiBIVFRQICR7eGhyLnN0YXR1c31gKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoKSA9PiByZWplY3QobmV3IEVycm9yKCdOZXR3b3JrIGVycm9yJykpKTtcbiAgICAgICAgICAgICAgICB4aHIub3BlbignUE9TVCcsIGAke2FwaUJhc2V9L3YxL2dhbGxlcnkvcGhvdG9zL3VwbG9hZGApO1xuICAgICAgICAgICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHhoci5zZW5kKGZkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHVwZGF0ZShpZHgsIHsgc3RhdGU6ICdlcnJvcicsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIFthcGlCYXNlLCBvbkNoYW5nZSwgcHJvcGVydHkucGF0aCwgdXBkYXRlXSk7XG4gICAgY29uc3QgYWRkRmlsZXMgPSAoMCwgcmVhY3RfMS51c2VDYWxsYmFjaykoKGZpbGVMaXN0KSA9PiB7XG4gICAgICAgIGlmICghZmlsZUxpc3QpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGFsbG93ZWQgPSBNYXRoLm1pbihmaWxlTGlzdC5sZW5ndGgsIDUwIC0gaXRlbXMubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgbmV3SXRlbXMgPSBBcnJheS5mcm9tKGZpbGVMaXN0KS5zbGljZSgwLCBhbGxvd2VkKS5tYXAoZiA9PiAoe1xuICAgICAgICAgICAgZmlsZTogZixcbiAgICAgICAgICAgIGxvY2FsVXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKGYpLFxuICAgICAgICAgICAgc3RhdGU6ICdwZW5kaW5nJyxcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICB9KSk7XG4gICAgICAgIHNldEl0ZW1zKHByZXYgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IFsuLi5wcmV2LCAuLi5uZXdJdGVtc107XG4gICAgICAgICAgICBuZXdJdGVtcy5mb3JFYWNoKChpdCwgaSkgPT4gdm9pZCB1cGxvYWRPbmUoaXQsIHByZXYubGVuZ3RoICsgaSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH0pO1xuICAgIH0sIFtpdGVtcy5sZW5ndGgsIHVwbG9hZE9uZV0pO1xuICAgIGNvbnN0IHN0YXRlQ29sb3IgPSB7XG4gICAgICAgIHBlbmRpbmc6ICcjNmI3MjgwJyxcbiAgICAgICAgdXBsb2FkaW5nOiAnIzYzNjZmMScsXG4gICAgICAgIGRvbmU6ICcjMjJjNTVlJyxcbiAgICAgICAgZXJyb3I6ICcjZWY0NDQ0JyxcbiAgICB9O1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDEyIH0gfSxcbiAgICAgICAgZXhpc3RpbmdVcmwgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW1nXCIsIHsgc3JjOiBleGlzdGluZ1VybCwgYWx0OiBcIkN1cnJlbnRcIiwgc3R5bGU6IHsgd2lkdGg6IDEyMCwgaGVpZ2h0OiA4MCwgb2JqZWN0Rml0OiAnY292ZXInLCBib3JkZXJSYWRpdXM6IDYsIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDEyOCwxMjgsMTI4LDAuMiknIH0gfSkpLFxuICAgICAgICBpdGVtcy5sZW5ndGggPCA1MCAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBvbkRyYWdPdmVyOiBlID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBzZXREcmFnZ2luZyh0cnVlKTsgfSwgb25EcmFnTGVhdmU6ICgpID0+IHNldERyYWdnaW5nKGZhbHNlKSwgb25Ecm9wOiBlID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBzZXREcmFnZ2luZyhmYWxzZSk7IGFkZEZpbGVzKGUuZGF0YVRyYW5zZmVyLmZpbGVzKTsgfSwgb25DbGljazogKCkgPT4gZmlsZVJlZi5jdXJyZW50Py5jbGljaygpLCBzdHlsZToge1xuICAgICAgICAgICAgICAgIGJvcmRlcjogYDJweCBkYXNoZWQgJHtkcmFnZ2luZyA/ICcjODE4Y2Y4JyA6ICdyZ2JhKDEyOCwxMjgsMTI4LDAuMyknfWAsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA4LCBwYWRkaW5nOiAnMjBweCAxNnB4JywgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJywgYmFja2dyb3VuZDogZHJhZ2dpbmcgPyAncmdiYSg5OSwxMDIsMjQxLDAuMDUpJyA6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIG9wYWNpdHk6IDAuNyB9IH0sXG4gICAgICAgICAgICAgICAgXCJEcm9wIHBob3RvcyBoZXJlIG9yIFwiLFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3Ryb25nXCIsIG51bGwsIFwiY2xpY2sgdG8gYnJvd3NlXCIpLFxuICAgICAgICAgICAgICAgIFwiIChtYXggNTApXCIpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHJlZjogZmlsZVJlZiwgdHlwZTogXCJmaWxlXCIsIG11bHRpcGxlOiB0cnVlLCBhY2NlcHQ6IFwiaW1hZ2UvanBlZyxpbWFnZS9wbmcsaW1hZ2Uvd2VicCxpbWFnZS9naWZcIiwgc3R5bGU6IHsgZGlzcGxheTogJ25vbmUnIH0sIG9uQ2hhbmdlOiBlID0+IGFkZEZpbGVzKGUudGFyZ2V0LmZpbGVzKSB9KSkpLFxuICAgICAgICBpdGVtcy5sZW5ndGggPiAwICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogOCB9IH0sIGl0ZW1zLm1hcCgoaXRlbSwgaSkgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsga2V5OiBpLCBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDEwIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW1nXCIsIHsgc3JjOiBpdGVtLnJlc3VsdFVybCA/PyBpdGVtLmxvY2FsVXJsLCBhbHQ6IGl0ZW0uZmlsZS5uYW1lLCBzdHlsZTogeyB3aWR0aDogNDgsIGhlaWdodDogMzYsIG9iamVjdEZpdDogJ2NvdmVyJywgYm9yZGVyUmFkaXVzOiA0LCBmbGV4U2hyaW5rOiAwIH0gfSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGZsZXg6IDEsIG1pbldpZHRoOiAwIH0gfSxcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMSwgb3BhY2l0eTogMC44LCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycgfSB9LCBpdGVtLmZpbGUubmFtZSksXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBoZWlnaHQ6IDQsIGJvcmRlclJhZGl1czogMiwgYmFja2dyb3VuZDogJ3JnYmEoMTI4LDEyOCwxMjgsMC4yKScsIG1hcmdpblRvcDogNCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJywgYm9yZGVyUmFkaXVzOiAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBgJHtpdGVtLnByb2dyZXNzfSVgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0YXRlQ29sb3JbaXRlbS5zdGF0ZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ3dpZHRoIDAuMTVzIGVhc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSksXG4gICAgICAgICAgICAgICAgaXRlbS5lcnJvciAmJiByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMCwgY29sb3I6ICcjZWY0NDQ0JywgbWFyZ2luVG9wOiAyIH0gfSwgaXRlbS5lcnJvcikpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEwLCBjb2xvcjogc3RhdGVDb2xvcltpdGVtLnN0YXRlXSwgZmxleFNocmluazogMCB9IH0sIGl0ZW0uc3RhdGUgPT09ICd1cGxvYWRpbmcnID8gYCR7aXRlbS5wcm9ncmVzc30lYCA6IGl0ZW0uc3RhdGUpKSkpKSkpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBob3RvLXVwbG9hZGVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5jb25zdCBhZG1pbmpzXzEgPSByZXF1aXJlKFwiYWRtaW5qc1wiKTtcbmNvbnN0IElOSVRJQUwgPSB7XG4gICAgcHVibGlzaGVkUG9zdHM6ICfigJMnLFxuICAgIGRyYWZ0UG9zdHM6ICfigJMnLFxuICAgIHByb2plY3RzOiAn4oCTJyxcbiAgICBwaG90b3M6ICfigJMnLFxuICAgIGFsYnVtczogJ+KAkycsXG59O1xuY29uc3QgQ0FSRFMgPSBbXG4gICAgeyBrZXk6ICdwdWJsaXNoZWRQb3N0cycsIGxhYmVsOiAnUHVibGlzaGVkIFBvc3RzJywgaWNvbjogJ/Cfk50nLCBhY2NlbnQ6ICcjNjM2NmYxJyB9LFxuICAgIHsga2V5OiAnZHJhZnRQb3N0cycsIGxhYmVsOiAnRHJhZnQgUG9zdHMnLCBpY29uOiAn4pyP77iPJywgYWNjZW50OiAnI2Y1OWUwYicgfSxcbiAgICB7IGtleTogJ3Byb2plY3RzJywgbGFiZWw6ICdQcm9qZWN0cycsIGljb246ICfwn5qAJywgYWNjZW50OiAnIzIyYzU1ZScgfSxcbiAgICB7IGtleTogJ3Bob3RvcycsIGxhYmVsOiAnUGhvdG9zJywgaWNvbjogJ/Cfk7cnLCBhY2NlbnQ6ICcjM2I4MmY2JyB9LFxuICAgIHsga2V5OiAnYWxidW1zJywgbGFiZWw6ICdBbGJ1bXMnLCBpY29uOiAn8J+Xgu+4jycsIGFjY2VudDogJyNhODU1ZjcnIH0sXG5dO1xuY29uc3QgRGFzaGJvYXJkID0gKCkgPT4ge1xuICAgIGNvbnN0IFtzdGF0cywgc2V0U3RhdHNdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKElOSVRJQUwpO1xuICAgIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKSh0cnVlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShudWxsKTtcbiAgICAoMCwgcmVhY3RfMS51c2VFZmZlY3QpKCgpID0+IHtcbiAgICAgICAgY29uc3QgYXBpID0gbmV3IGFkbWluanNfMS5BcGlDbGllbnQoKTtcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gbG9hZCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3B1YlBvc3RzUmVzLCBhbGxQb3N0c1JlcywgcHJvamVjdHNSZXMsIHBob3Rvc1JlcywgYWxidW1zUmVzXSA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChbXG4gICAgICAgICAgICAgICAgICAgIGZldGNoKCcvdjEvYmxvZycsIHsgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyB9KS50aGVuKHIgPT4gci5qc29uKCkpLFxuICAgICAgICAgICAgICAgICAgICBhcGkucmVzb3VyY2VBY3Rpb24oeyByZXNvdXJjZUlkOiAnQmxvZ1Bvc3QnLCBhY3Rpb25OYW1lOiAnbGlzdCcsIHBhcmFtczogeyBwZXJQYWdlOiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIGZldGNoKCcvdjEvcHJvamVjdHMnLCB7IGNyZWRlbnRpYWxzOiAnaW5jbHVkZScgfSkudGhlbihyID0+IHIuanNvbigpKSxcbiAgICAgICAgICAgICAgICAgICAgZmV0Y2goJy92MS9nYWxsZXJ5L3Bob3RvcycsIHsgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyB9KS50aGVuKHIgPT4gci5qc29uKCkpLFxuICAgICAgICAgICAgICAgICAgICBmZXRjaCgnL3YxL2dhbGxlcnkvYWxidW1zJywgeyBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pLnRoZW4ociA9PiByLmpzb24oKSksXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHVibGlzaGVkUG9zdHMgPSBwdWJQb3N0c1Jlcy5zdGF0dXMgPT09ICdmdWxmaWxsZWQnID8gcHViUG9zdHNSZXMudmFsdWUubGVuZ3RoIDogJ+KAkyc7XG4gICAgICAgICAgICAgICAgY29uc3QgdG90YWxQb3N0cyA9IGFsbFBvc3RzUmVzLnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCdcbiAgICAgICAgICAgICAgICAgICAgPyAoYWxsUG9zdHNSZXMudmFsdWU/LmRhdGE/Lm1ldGE/LnRvdGFsID8/ICfigJMnKVxuICAgICAgICAgICAgICAgICAgICA6ICfigJMnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRyYWZ0UG9zdHMgPSB0eXBlb2YgdG90YWxQb3N0cyA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHB1Ymxpc2hlZFBvc3RzID09PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICA/IHRvdGFsUG9zdHMgLSBwdWJsaXNoZWRQb3N0c1xuICAgICAgICAgICAgICAgICAgICA6ICfigJMnO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2plY3RzID0gcHJvamVjdHNSZXMuc3RhdHVzID09PSAnZnVsZmlsbGVkJyA/IHByb2plY3RzUmVzLnZhbHVlLmxlbmd0aCA6ICfigJMnO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBob3RvcyA9IHBob3Rvc1Jlcy5zdGF0dXMgPT09ICdmdWxmaWxsZWQnXG4gICAgICAgICAgICAgICAgICAgID8gKHBob3Rvc1Jlcy52YWx1ZT8udG90YWwgPz8gJ+KAkycpXG4gICAgICAgICAgICAgICAgICAgIDogJ+KAkyc7XG4gICAgICAgICAgICAgICAgY29uc3QgYWxidW1zID0gYWxidW1zUmVzLnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcgPyBhbGJ1bXNSZXMudmFsdWUubGVuZ3RoIDogJ+KAkyc7XG4gICAgICAgICAgICAgICAgc2V0U3RhdHMoeyBwdWJsaXNoZWRQb3N0cywgZHJhZnRQb3N0cywgcHJvamVjdHMsIHBob3RvcywgYWxidW1zIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcihlPy5tZXNzYWdlID8/ICdGYWlsZWQgdG8gbG9hZCBzdGF0cycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdm9pZCBsb2FkKCk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGhvdXIgPSBuZXcgRGF0ZSgpLmdldEhvdXJzKCk7XG4gICAgY29uc3QgZ3JlZXRpbmcgPSBob3VyIDwgMTIgPyAnR29vZCBtb3JuaW5nJyA6IGhvdXIgPCAxOCA/ICdHb29kIGFmdGVybm9vbicgOiAnR29vZCBldmVuaW5nJztcbiAgICByZXR1cm4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgcGFkZGluZzogJzMycHgnLCBmb250RmFtaWx5OiAnc3lzdGVtLXVpLCBzYW5zLXNlcmlmJyB9IH0sXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAnMzJweCcgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJoMVwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAnMjhweCcsIGZvbnRXZWlnaHQ6IDcwMCwgbWFyZ2luOiAwLCBjb2xvcjogJyNlMmU4ZjAnIH0gfSxcbiAgICAgICAgICAgICAgICBncmVldGluZyxcbiAgICAgICAgICAgICAgICBcIiBcXHVEODNEXFx1REM0QlwiKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwicFwiLCB7IHN0eWxlOiB7IGNvbG9yOiAnIzk0YTNiOCcsIG1hcmdpblRvcDogJzZweCcsIGZvbnRTaXplOiAnMTVweCcgfSB9LCBcIkhlcmUncyBhIGxpdmUgc25hcHNob3Qgb2YgeW91ciBwb3J0Zm9saW8gY29udGVudC5cIikpLFxuICAgICAgICBlcnJvciAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBwYWRkaW5nOiAnMTJweCAxNnB4JywgYmFja2dyb3VuZDogJ3JnYmEoMjM5LDY4LDY4LDAuMTUpJywgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMjM5LDY4LDY4LDAuNCknLCBib3JkZXJSYWRpdXM6ICc4cHgnLCBjb2xvcjogJyNmY2E1YTUnLCBtYXJnaW5Cb3R0b206ICcyNHB4JywgZm9udFNpemU6ICcxNHB4JyB9IH0sXG4gICAgICAgICAgICBcIlxcdTI2QTBcXHVGRTBGIFwiLFxuICAgICAgICAgICAgZXJyb3IpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMjAwcHgsIDFmcikpJywgZ2FwOiAnMjBweCcgfSB9LCBDQVJEUy5tYXAoKHsga2V5LCBsYWJlbCwgaWNvbiwgYWNjZW50IH0pID0+IChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IGtleToga2V5LCBzdHlsZToge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDMwLDQxLDU5LDAuOCknLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogYDFweCBzb2xpZCAke2FjY2VudH00MGAsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogYDAgMCAwIDFweCAke2FjY2VudH0yMCwgMCA0cHggMjRweCByZ2JhKDAsMCwwLDAuMylgLFxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gMTUwbXMnLFxuICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogJzI4cHgnLCBtYXJnaW5Cb3R0b206ICcxMnB4JywgbGluZUhlaWdodDogMSB9IH0sIGljb24pLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzM2cHgnLFxuICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA3MDAsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBsb2FkaW5nID8gJyM0YjU1NjMnIDogYWNjZW50LFxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAxLFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICc2cHgnLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnY29sb3IgMzAwbXMnLFxuICAgICAgICAgICAgICAgIH0gfSwgbG9hZGluZyA/ICfigJQnIDogU3RyaW5nKHN0YXRzW2tleV0pKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgY29sb3I6ICcjOTRhM2I4JywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNTAwLCBsZXR0ZXJTcGFjaW5nOiAnMC4wMjVlbScgfSB9LCBsYWJlbCkpKSkpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IG1hcmdpblRvcDogJzQwcHgnIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaDJcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogJzE2cHgnLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnI2NiZDVlMScsIG1hcmdpbkJvdHRvbTogJzE2cHgnIH0gfSwgXCJRdWljayBhY3Rpb25zXCIpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzEycHgnLCBmbGV4V3JhcDogJ3dyYXAnIH0gfSwgW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICcrIE5ldyBCbG9nIFBvc3QnLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9CbG9nUG9zdC9hY3Rpb25zL25ldycsIGNvbG9yOiAnIzYzNjZmMScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnKyBOZXcgUHJvamVjdCcsIGhyZWY6ICcvYWRtaW4vcmVzb3VyY2VzL1Byb2plY3QvYWN0aW9ucy9uZXcnLCBjb2xvcjogJyMyMmM1NWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJysgTmV3IEFsYnVtJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvQWxidW0vYWN0aW9ucy9uZXcnLCBjb2xvcjogJyNhODU1ZjcnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJysgVXBsb2FkIFBob3RvcycsIGhyZWY6ICcvYWRtaW4vcmVzb3VyY2VzL1Bob3RvL2FjdGlvbnMvbmV3JywgY29sb3I6ICcjM2I4MmY2JyB9LFxuICAgICAgICAgICAgXS5tYXAoKHsgbGFiZWwsIGhyZWYsIGNvbG9yIH0pID0+IChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImFcIiwgeyBrZXk6IGhyZWYsIGhyZWY6IGhyZWYsIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOXB4IDE4cHgnLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBgJHtjb2xvcn0yMGAsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogYDFweCBzb2xpZCAke2NvbG9yfTYwYCxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTNweCcsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDYwMCxcbiAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JhY2tncm91bmQgMTUwbXMnLFxuICAgICAgICAgICAgICAgIH0gfSwgbGFiZWwpKSkpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIHsgc3R5bGU6IHsgY29sb3I6ICcjNDc1NTY5JywgZm9udFNpemU6ICcxMnB4JywgbWFyZ2luVG9wOiAnMzJweCcgfSB9LFxuICAgICAgICAgICAgXCJTdGF0cyBsb2FkZWQgYXQgXCIsXG4gICAgICAgICAgICBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpKSkpO1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IERhc2hib2FyZDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhc2hib2FyZC5qcy5tYXAiLCJBZG1pbkpTLlVzZXJDb21wb25lbnRzID0ge31cbmltcG9ydCBNYXJrZG93bkVkaXRvciBmcm9tICcuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL21hcmtkb3duLWVkaXRvcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTWFya2Rvd25FZGl0b3IgPSBNYXJrZG93bkVkaXRvclxuaW1wb3J0IFRhZ1BpY2tlciBmcm9tICcuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL3RhZy1waWNrZXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlRhZ1BpY2tlciA9IFRhZ1BpY2tlclxuaW1wb3J0IFNraWxsUGlja2VyIGZyb20gJy4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvc2tpbGwtcGlja2VyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Ta2lsbFBpY2tlciA9IFNraWxsUGlja2VyXG5pbXBvcnQgTWVkaWFVcGxvYWRlciBmcm9tICcuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL21lZGlhLXVwbG9hZGVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5NZWRpYVVwbG9hZGVyID0gTWVkaWFVcGxvYWRlclxuaW1wb3J0IFZpZGVvTWFuYWdlciBmcm9tICcuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL3ZpZGVvLW1hbmFnZXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlZpZGVvTWFuYWdlciA9IFZpZGVvTWFuYWdlclxuaW1wb3J0IFBob3RvVXBsb2FkZXIgZnJvbSAnLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy9waG90by11cGxvYWRlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUGhvdG9VcGxvYWRlciA9IFBob3RvVXBsb2FkZXJcbmltcG9ydCBEYXNoYm9hcmQgZnJvbSAnLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy9kYXNoYm9hcmQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkRhc2hib2FyZCA9IERhc2hib2FyZCJdLCJuYW1lcyI6WyJyZXN1bHQiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsIm1hcmtkb3duRWRpdG9yIiwidmFsdWUiLCJyZWFjdF8xIiwiX19pbXBvcnRTdGFyIiwicmVxdWlyZSQkMCIsImVzYyIsInMiLCJyZXBsYWNlIiwicmVuZGVyTWFya2Rvd24iLCJyYXciLCJzYXZlZCIsIl8iLCJsYW5nIiwiY29kZSIsInB1c2giLCJ0cmltIiwibGVuZ3RoIiwiYyIsImxpbmVzIiwic3BsaXQiLCJvdXQiLCJsaXN0VHlwZSIsImZsdXNoTGlzdCIsImxpc3RCdWYiLCJqb2luIiwibGluZSIsImgiLCJtYXRjaCIsImJxIiwidGVzdCIsInVsbSIsIm9sbSIsInR5cGUiLCJzZWN0aW9ucyIsIm1hcCIsInNlYyIsInQiLCJzdGFydHNXaXRoIiwiZm9yRWFjaCIsImJsayIsImkiLCJNYXJrZG93bkVkaXRvciIsInByb3BlcnR5IiwicmVjb3JkIiwib25DaGFuZ2UiLCJmaWVsZFBhdGgiLCJwYXRoIiwiaW5pdGlhbFZhbHVlIiwicGFyYW1zIiwic2V0VmFsdWUiLCJ1c2VTdGF0ZSIsInByZXZpZXciLCJzZXRQcmV2aWV3IiwidXBsb2FkaW5nIiwic2V0VXBsb2FkaW5nIiwiYWN0aXZlVGFiIiwic2V0QWN0aXZlVGFiIiwidGV4dGFyZWFSZWYiLCJ1c2VSZWYiLCJmaWxlSW5wdXRSZWYiLCJkZWJvdW5jZVJlZiIsInVzZUVmZmVjdCIsInYiLCJpZCIsImhhbmRsZUNoYW5nZSIsInVzZUNhbGxiYWNrIiwiZSIsInRhcmdldCIsImN1cnJlbnQiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiaW5zZXJ0QXRDdXJzb3IiLCJ0ZXh0IiwidGEiLCJzdGFydCIsInNlbGVjdGlvblN0YXJ0IiwiZW5kIiwibmV4dCIsInNsaWNlIiwic2VsZWN0aW9uRW5kIiwiaGFuZGxlVXBsb2FkIiwiZmlsZSIsImZkIiwiRm9ybURhdGEiLCJhcHBlbmQiLCJyZXMiLCJmZXRjaCIsIm1ldGhvZCIsImJvZHkiLCJjcmVkZW50aWFscyIsIm9rIiwidXJsIiwianNvbiIsIm5hbWUiLCJlcnIiLCJhbGVydCIsIm1lc3NhZ2UiLCJlZGl0b3JTdHlsZSIsImZsZXgiLCJmb250RmFtaWx5IiwiZm9udFNpemUiLCJsaW5lSGVpZ2h0IiwicGFkZGluZyIsImJvcmRlciIsImJvcmRlclJhZGl1cyIsInJlc2l6ZSIsImJhY2tncm91bmQiLCJjb2xvciIsIm1pbkhlaWdodCIsImJveFNpemluZyIsIm92ZXJmbG93WSIsInByZXZpZXdTdHlsZSIsInRhYkJ0biIsImFjdGl2ZSIsImZvbnRXZWlnaHQiLCJjdXJzb3IiLCJkZWZhdWx0IiwiY3JlYXRlRWxlbWVudCIsInN0eWxlIiwiZGlzcGxheSIsImZsZXhEaXJlY3Rpb24iLCJnYXAiLCJhbGlnbkl0ZW1zIiwiZmxleFdyYXAiLCJrZXkiLCJvbkNsaWNrIiwibGFiZWwiLCJ0aXRsZSIsImluc2VydCIsIl9fc2V0TW9kdWxlRGVmYXVsdCIsIm1vZCIsInRhZ1BpY2tlciIsInRoaXMiLCJhZG1pbmpzXzEiLCJyZXF1aXJlJCQxIiwiYXBpIiwiQXBpQ2xpZW50IiwiVGFnUGlja2VyIiwiYWxsVGFncyIsInNldEFsbFRhZ3MiLCJzZWxlY3RlZCIsInNldFNlbGVjdGVkIiwic2V0UXVlcnkiLCJzZXRTaG93RHJvcGRvd24iLCJ0aGVuIiwiciIsInRhZ3MiLCJjYXRjaCIsImZyb21QYXJhbXMiLCJwb3B1bGF0ZWQiLCJmcm9tUG9wdWxhdGVkIiwiZmlsdGVyIiwic2VlbiIsIm1lcmdlZCIsImhhcyIsImFkZCIsImFkZFRhZyIsInRhZyIsInNvbWUiLCJlbWl0IiwicmVtb3ZlVGFnIiwiY3JlYXRlVGFnIiwicXVlcnkiLCJ0b0xvd2VyQ2FzZSIsImV4aXN0aW5nIiwiZmluZCIsInJlc291cmNlSWQiLCJhY3Rpb25OYW1lIiwiZGF0YSIsImNyZWF0ZWQiLCJwcmV2Iiwic29ydCIsImEiLCJiIiwibG9jYWxlQ29tcGFyZSIsImZpbHRlcmVkIiwiaW5jbHVkZXMiLCJjaGlwIiwiYmFja2dyb3VuZENvbG9yIiwicmVtb3ZlQnRuIiwicG9zaXRpb24iLCJfZGVmYXVsdCIsInNraWxsUGlja2VyIiwiU2tpbGxQaWNrZXIiLCJza2lsbHMiLCJzZXRTa2lsbHMiLCJpZHMiLCJlbnRyaWVzIiwidmFsIiwiZW5kc1dpdGgiLCJCb29sZWFuIiwiYmFzZSIsIndpbmRvdyIsIl9fQVBJX0JBU0VfXyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJob3N0bmFtZSIsImZpbmFsbHkiLCJzZXRMb2FkaW5nIiwieCIsIlNldCIsImNhdGVnb3J5IiwidGV4dFRyYW5zZm9ybSIsImxldHRlclNwYWNpbmciLCJvcGFjaXR5Iiwic2siLCJ0b2dnbGUiLCJtZWRpYVVwbG9hZGVyIiwiTWVkaWFVcGxvYWRlciIsImFwaUJhc2UiLCJ1bmRlZmluZWQiLCJhbHRUZXh0IiwiaXRlbXMiLCJzZXRJdGVtcyIsImluaXRpYWwiLCJkcmFnZ2luZyIsInNldERyYWdnaW5nIiwiZHJhZ0lkeCIsImZpbGVSZWYiLCJtIiwiZXJyb3IiLCJmaWxlcyIsInBsYWNlaG9sZGVycyIsIkFycmF5IiwiZnJvbSIsImYiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJFcnJvciIsInN0YXR1cyIsImlkeCIsImZpbmRJbmRleCIsIm9uRHJhZ092ZXIiLCJtb3ZlZCIsInNwbGljZSIsIm9uRHJvcFpvbmUiLCJwcmV2ZW50RGVmYXVsdCIsImRhdGFUcmFuc2ZlciIsInRleHRBbGlnbiIsInRyYW5zaXRpb24iLCJ2aWRlb01hbmFnZXIiLCJWaWRlb01hbmFnZXIiLCJkZXRlY3RTb3VyY2UiLCJzb3VyY2UiLCJuZXdVcmwiLCJzZXROZXdVcmwiLCJuZXdUaXRsZSIsImFkZEl0ZW0iLCJpdGVtIiwic2V0TmV3VGl0bGUiLCJsYWJlbFN0eWxlIiwibWFyZ2luQm90dG9tIiwiaW5wdXRTdHlsZSIsIndpZHRoIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJwbGFjZWhvbGRlciIsIm9uS2V5RG93biIsImFsaWduU2VsZiIsImRyYWdnYWJsZSIsIm9uRHJhZ1N0YXJ0IiwicGhvdG9VcGxvYWRlciIsIlBob3RvVXBsb2FkZXIiLCJleGlzdGluZ1VybCIsInVwZGF0ZSIsInBhdGNoIiwiaXQiLCJ1cGxvYWRPbmUiLCJzdGF0ZSIsInByb2dyZXNzIiwiWE1MSHR0cFJlcXVlc3QiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInhociIsInVwbG9hZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJsZW5ndGhDb21wdXRhYmxlIiwibG9hZGVkIiwidG90YWwiLCJKU09OIiwicGFyc2UiLCJyZXNwb25zZVRleHQiLCJyZXN1bHRVcmwiLCJvcmlnaW5hbFVybCIsIm9wZW4iLCJ3aXRoQ3JlZGVudGlhbHMiLCJzZW5kIiwiYWRkRmlsZXMiLCJmaWxlTGlzdCIsImFsbG93ZWQiLCJNYXRoIiwibWluIiwibmV3SXRlbXMiLCJsb2NhbFVybCIsInN0YXRlQ29sb3IiLCJwZW5kaW5nIiwiZG9uZSIsInNyYyIsImFsdCIsImhlaWdodCIsIm9iamVjdEZpdCIsIm9uRHJhZ0xlYXZlIiwib25Ecm9wIiwiY2xpY2siLCJkYXNoYm9hcmQiLCJJTklUSUFMIiwicHVibGlzaGVkUG9zdHMiLCJkcmFmdFBvc3RzIiwicHJvamVjdHMiLCJwaG90b3MiLCJhbGJ1bXMiLCJDQVJEUyIsImljb24iLCJhY2NlbnQiLCJEYXNoYm9hcmQiLCJzdGF0cyIsInNldFN0YXRzIiwic2V0RXJyb3IiLCJsb2FkIiwiYWxsUG9zdHNSZXMiLCJwaG90b3NSZXMiLCJhbGJ1bXNSZXMiLCJhbGxTZXR0bGVkIiwicmVzb3VyY2VBY3Rpb24iLCJwZXJQYWdlIiwicHViUG9zdHNSZXMiLCJ0b3RhbFBvc3RzIiwibWV0YSIsInByb2plY3RzUmVzIiwiRGF0ZSIsImdldEhvdXJzIiwiaG91ciIsImdyZWV0aW5nIiwibWFyZ2luVG9wIiwiZ3JpZFRlbXBsYXRlQ29sdW1ucyIs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
