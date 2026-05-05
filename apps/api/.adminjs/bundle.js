(function (require$$0, require$$1) {
	'use strict';

	function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

	var require$$0__default = /*#__PURE__*/_interopDefault(require$$0);
	var require$$1__default = /*#__PURE__*/_interopDefault(require$$1);

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var markdownEditor = {};

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
	Object.defineProperty(markdownEditor, "__esModule", {
	  value: true
	});
	const react_1$1 = __importStar$1(require$$0__default.default);
	const MarkdownEditor = ({
	  property,
	  record,
	  onChange
	}) => {
	  const path = property.path;
	  const initialValue = record?.params?.[path] ?? '';
	  const [value, setValue] = (0, react_1$1.useState)(initialValue);
	  const [uploading, setUploading] = (0, react_1$1.useState)(false);
	  const textareaRef = (0, react_1$1.useRef)(null);
	  const fileInputRef = (0, react_1$1.useRef)(null);
	  (0, react_1$1.useEffect)(() => {
	    const fromRecord = record?.params?.[path] ?? '';
	    setValue(fromRecord);
	  }, [record?.id]);
	  const handleChange = e => {
	    setValue(e.target.value);
	    onChange(path, e.target.value);
	  };
	  const insertAtCursor = text => {
	    const ta = textareaRef.current;
	    if (!ta) return;
	    const start = ta.selectionStart ?? value.length;
	    const end = ta.selectionEnd ?? value.length;
	    const next = value.slice(0, start) + text + value.slice(end);
	    setValue(next);
	    onChange(path, next);
	    setTimeout(() => {
	      ta.selectionStart = ta.selectionEnd = start + text.length;
	      ta.focus();
	    }, 0);
	  };
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
	      if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`);
	      const {
	        url
	      } = await res.json();
	      const alt = file.name.replace(/\.[^.]+$/, '');
	      insertAtCursor(`![${alt}](${url})`);
	    } catch (err) {
	      alert(`Image upload failed: ${err?.message ?? 'unknown error'}`);
	    } finally {
	      setUploading(false);
	      if (fileInputRef.current) fileInputRef.current.value = '';
	    }
	  };
	  const ta = {
	    width: '100%',
	    fontFamily: '"Fira Code", "Cascadia Code", monospace',
	    fontSize: '13px',
	    lineHeight: '1.6',
	    padding: '12px',
	    border: '1px solid #4a4a6a',
	    borderRadius: '6px',
	    resize: 'vertical',
	    backgroundColor: '#1a1a2e',
	    color: '#e0e0e0',
	    minHeight: '400px',
	    boxSizing: 'border-box'
	  };
	  const btn = {
	    padding: '7px 16px',
	    backgroundColor: uploading ? '#555' : '#3d5af1',
	    color: '#fff',
	    border: 'none',
	    borderRadius: '5px',
	    cursor: uploading ? 'not-allowed' : 'pointer',
	    fontSize: '13px',
	    fontWeight: 500
	  };
	  return react_1$1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: '10px'
	    }
	  }, react_1$1.default.createElement("textarea", {
	    ref: textareaRef,
	    value: value,
	    onChange: handleChange,
	    style: ta
	  }), react_1$1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '10px',
	      alignItems: 'center'
	    }
	  }, react_1$1.default.createElement("button", {
	    type: "button",
	    style: btn,
	    disabled: uploading,
	    onClick: () => fileInputRef.current?.click()
	  }, uploading ? '⏳ Uploading…' : '📷 Insert Image'), uploading && react_1$1.default.createElement("span", {
	    style: {
	      fontSize: '12px',
	      color: '#aaa'
	    }
	  }, "Uploading to Cloudinary\u2026"), react_1$1.default.createElement("input", {
	    ref: fileInputRef,
	    type: "file",
	    accept: "image/*",
	    onChange: handleUpload,
	    style: {
	      display: 'none'
	    }
	  })), react_1$1.default.createElement("p", {
	    style: {
	      fontSize: '11px',
	      color: '#888',
	      margin: 0
	    }
	  }, "Supports GitHub Flavored Markdown (GFM) \u00B7 tables \u00B7 task lists \u00B7 fenced code blocks"));
	};
	var _default$1 = markdownEditor.default = MarkdownEditor;

	var tagPicker = {};

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
	Object.defineProperty(tagPicker, "__esModule", {
	  value: true
	});
	const react_1 = __importStar(require$$0__default.default);
	const adminjs_1 = require$$1__default.default;
	const api = new adminjs_1.ApiClient();
	const TagPicker = ({
	  property,
	  record,
	  onChange
	}) => {
	  const [allTags, setAllTags] = (0, react_1.useState)([]);
	  const [selected, setSelected] = (0, react_1.useState)([]);
	  const [query, setQuery] = (0, react_1.useState)('');
	  const [showDropdown, setShowDropdown] = (0, react_1.useState)(false);
	  const inputRef = (0, react_1.useRef)(null);
	  (0, react_1.useEffect)(() => {
	    fetch('/v1/blog/tags', {
	      credentials: 'include'
	    }).then(r => r.json()).then(tags => setAllTags(tags)).catch(() => {});
	    const populated = record?.populated?.[property.path] ?? [];
	    const current = populated.map(r => ({
	      id: r.params?.id,
	      name: r.params?.name
	    })).filter(t => t.id && t.name);
	    setSelected(current);
	  }, [record?.id]);
	  const emit = tags => {
	    onChange(property.path, tags.map(t => t.id));
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
	  return react_1.default.createElement("div", {
	    style: {
	      position: 'relative'
	    }
	  }, react_1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexWrap: 'wrap',
	      gap: '6px',
	      marginBottom: '8px',
	      minHeight: '28px'
	    }
	  }, selected.map(tag => react_1.default.createElement("span", {
	    key: tag.id,
	    style: chip
	  }, tag.name, react_1.default.createElement("button", {
	    type: "button",
	    style: removeBtn,
	    onClick: () => removeTag(tag.id)
	  }, "\u00D7")))), react_1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '6px'
	    }
	  }, react_1.default.createElement("input", {
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
	  }), query.trim() && react_1.default.createElement("button", {
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
	  }, "+ Add")), showDropdown && filtered.length > 0 && react_1.default.createElement("ul", {
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
	  }, filtered.map(tag => react_1.default.createElement("li", {
	    key: tag.id,
	    onMouseDown: () => addTag(tag),
	    style: {
	      padding: '8px 12px',
	      cursor: 'pointer',
	      fontSize: '13px',
	      color: '#333'
	    }
	  }, tag.name))), react_1.default.createElement("p", {
	    style: {
	      fontSize: '11px',
	      color: '#888',
	      margin: '6px 0 0'
	    }
	  }, "Type to search existing tags \u00B7 press Enter or click \"+ Add\" to create new"));
	};
	var _default = tagPicker.default = TagPicker;

	AdminJS.UserComponents = {};
	AdminJS.UserComponents.MarkdownEditor = _default$1;
	AdminJS.UserComponents.TagPicker = _default;

})(React, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL21hcmtkb3duLWVkaXRvci5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvdGFnLXBpY2tlci5qcyIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5jb25zdCBNYXJrZG93bkVkaXRvciA9ICh7IHByb3BlcnR5LCByZWNvcmQsIG9uQ2hhbmdlIH0pID0+IHtcbiAgICBjb25zdCBwYXRoID0gcHJvcGVydHkucGF0aDtcbiAgICBjb25zdCBpbml0aWFsVmFsdWUgPSByZWNvcmQ/LnBhcmFtcz8uW3BhdGhdID8/ICcnO1xuICAgIGNvbnN0IFt2YWx1ZSwgc2V0VmFsdWVdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGluaXRpYWxWYWx1ZSk7XG4gICAgY29uc3QgW3VwbG9hZGluZywgc2V0VXBsb2FkaW5nXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShmYWxzZSk7XG4gICAgY29uc3QgdGV4dGFyZWFSZWYgPSAoMCwgcmVhY3RfMS51c2VSZWYpKG51bGwpO1xuICAgIGNvbnN0IGZpbGVJbnB1dFJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgKDAsIHJlYWN0XzEudXNlRWZmZWN0KSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZyb21SZWNvcmQgPSByZWNvcmQ/LnBhcmFtcz8uW3BhdGhdID8/ICcnO1xuICAgICAgICBzZXRWYWx1ZShmcm9tUmVjb3JkKTtcbiAgICB9LCBbcmVjb3JkPy5pZF0pO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHNldFZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgb25DaGFuZ2UocGF0aCwgZS50YXJnZXQudmFsdWUpO1xuICAgIH07XG4gICAgY29uc3QgaW5zZXJ0QXRDdXJzb3IgPSAodGV4dCkgPT4ge1xuICAgICAgICBjb25zdCB0YSA9IHRleHRhcmVhUmVmLmN1cnJlbnQ7XG4gICAgICAgIGlmICghdGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gdGEuc2VsZWN0aW9uU3RhcnQgPz8gdmFsdWUubGVuZ3RoO1xuICAgICAgICBjb25zdCBlbmQgPSB0YS5zZWxlY3Rpb25FbmQgPz8gdmFsdWUubGVuZ3RoO1xuICAgICAgICBjb25zdCBuZXh0ID0gdmFsdWUuc2xpY2UoMCwgc3RhcnQpICsgdGV4dCArIHZhbHVlLnNsaWNlKGVuZCk7XG4gICAgICAgIHNldFZhbHVlKG5leHQpO1xuICAgICAgICBvbkNoYW5nZShwYXRoLCBuZXh0KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0YS5zZWxlY3Rpb25TdGFydCA9IHRhLnNlbGVjdGlvbkVuZCA9IHN0YXJ0ICsgdGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB0YS5mb2N1cygpO1xuICAgICAgICB9LCAwKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZVVwbG9hZCA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlcz8uWzBdO1xuICAgICAgICBpZiAoIWZpbGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldFVwbG9hZGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgICBmZC5hcHBlbmQoJ2ZpbGUnLCBmaWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcvdjEvdXBsb2FkJywgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogZmQsIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScgfSk7XG4gICAgICAgICAgICBpZiAoIXJlcy5vaylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVwbG9hZCBmYWlsZWQgKEhUVFAgJHtyZXMuc3RhdHVzfSlgKTtcbiAgICAgICAgICAgIGNvbnN0IHsgdXJsIH0gPSBhd2FpdCByZXMuanNvbigpO1xuICAgICAgICAgICAgY29uc3QgYWx0ID0gZmlsZS5uYW1lLnJlcGxhY2UoL1xcLlteLl0rJC8sICcnKTtcbiAgICAgICAgICAgIGluc2VydEF0Q3Vyc29yKGAhWyR7YWx0fV0oJHt1cmx9KWApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGFsZXJ0KGBJbWFnZSB1cGxvYWQgZmFpbGVkOiAke2Vycj8ubWVzc2FnZSA/PyAndW5rbm93biBlcnJvcid9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRVcGxvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgaWYgKGZpbGVJbnB1dFJlZi5jdXJyZW50KVxuICAgICAgICAgICAgICAgIGZpbGVJbnB1dFJlZi5jdXJyZW50LnZhbHVlID0gJyc7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHRhID0ge1xuICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICBmb250RmFtaWx5OiAnXCJGaXJhIENvZGVcIiwgXCJDYXNjYWRpYSBDb2RlXCIsIG1vbm9zcGFjZScsXG4gICAgICAgIGZvbnRTaXplOiAnMTNweCcsXG4gICAgICAgIGxpbmVIZWlnaHQ6ICcxLjYnLFxuICAgICAgICBwYWRkaW5nOiAnMTJweCcsXG4gICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjNGE0YTZhJyxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgcmVzaXplOiAndmVydGljYWwnLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMWExYTJlJyxcbiAgICAgICAgY29sb3I6ICcjZTBlMGUwJyxcbiAgICAgICAgbWluSGVpZ2h0OiAnNDAwcHgnLFxuICAgICAgICBib3hTaXppbmc6ICdib3JkZXItYm94JyxcbiAgICB9O1xuICAgIGNvbnN0IGJ0biA9IHtcbiAgICAgICAgcGFkZGluZzogJzdweCAxNnB4JyxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiB1cGxvYWRpbmcgPyAnIzU1NScgOiAnIzNkNWFmMScsXG4gICAgICAgIGNvbG9yOiAnI2ZmZicsXG4gICAgICAgIGJvcmRlcjogJ25vbmUnLFxuICAgICAgICBib3JkZXJSYWRpdXM6ICc1cHgnLFxuICAgICAgICBjdXJzb3I6IHVwbG9hZGluZyA/ICdub3QtYWxsb3dlZCcgOiAncG9pbnRlcicsXG4gICAgICAgIGZvbnRTaXplOiAnMTNweCcsXG4gICAgICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICB9O1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6ICcxMHB4JyB9IH0sXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwidGV4dGFyZWFcIiwgeyByZWY6IHRleHRhcmVhUmVmLCB2YWx1ZTogdmFsdWUsIG9uQ2hhbmdlOiBoYW5kbGVDaGFuZ2UsIHN0eWxlOiB0YSB9KSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzEwcHgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIHN0eWxlOiBidG4sIGRpc2FibGVkOiB1cGxvYWRpbmcsIG9uQ2xpY2s6ICgpID0+IGZpbGVJbnB1dFJlZi5jdXJyZW50Py5jbGljaygpIH0sIHVwbG9hZGluZyA/ICfij7MgVXBsb2FkaW5n4oCmJyA6ICfwn5O3IEluc2VydCBJbWFnZScpLFxuICAgICAgICAgICAgdXBsb2FkaW5nICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBzdHlsZTogeyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyNhYWEnIH0gfSwgXCJVcGxvYWRpbmcgdG8gQ2xvdWRpbmFyeVxcdTIwMjZcIikpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHJlZjogZmlsZUlucHV0UmVmLCB0eXBlOiBcImZpbGVcIiwgYWNjZXB0OiBcImltYWdlLypcIiwgb25DaGFuZ2U6IGhhbmRsZVVwbG9hZCwgc3R5bGU6IHsgZGlzcGxheTogJ25vbmUnIH0gfSkpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInBcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM4ODgnLCBtYXJnaW46IDAgfSB9LCBcIlN1cHBvcnRzIEdpdEh1YiBGbGF2b3JlZCBNYXJrZG93biAoR0ZNKSBcXHUwMEI3IHRhYmxlcyBcXHUwMEI3IHRhc2sgbGlzdHMgXFx1MDBCNyBmZW5jZWQgY29kZSBibG9ja3NcIikpKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBNYXJrZG93bkVkaXRvcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcmtkb3duLWVkaXRvci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3duS2V5cyA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICB2YXIgYXIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSkgYXJbYXIubGVuZ3RoXSA9IGs7XG4gICAgICAgICAgICByZXR1cm4gYXI7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvd25LZXlzKG8pO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtb2QpIHtcbiAgICAgICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgPSBvd25LZXlzKG1vZCksIGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykgaWYgKGtbaV0gIT09IFwiZGVmYXVsdFwiKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGtbaV0pO1xuICAgICAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcmVhY3RfMSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwicmVhY3RcIikpO1xuY29uc3QgYWRtaW5qc18xID0gcmVxdWlyZShcImFkbWluanNcIik7XG5jb25zdCBhcGkgPSBuZXcgYWRtaW5qc18xLkFwaUNsaWVudCgpO1xuY29uc3QgVGFnUGlja2VyID0gKHsgcHJvcGVydHksIHJlY29yZCwgb25DaGFuZ2UgfSkgPT4ge1xuICAgIGNvbnN0IFthbGxUYWdzLCBzZXRBbGxUYWdzXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShbXSk7XG4gICAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoW10pO1xuICAgIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKCcnKTtcbiAgICBjb25zdCBbc2hvd0Ryb3Bkb3duLCBzZXRTaG93RHJvcGRvd25dID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICBjb25zdCBpbnB1dFJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgKDAsIHJlYWN0XzEudXNlRWZmZWN0KSgoKSA9PiB7XG4gICAgICAgIGZldGNoKCcvdjEvYmxvZy90YWdzJywgeyBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pXG4gICAgICAgICAgICAudGhlbihyID0+IHIuanNvbigpKVxuICAgICAgICAgICAgLnRoZW4oKHRhZ3MpID0+IHNldEFsbFRhZ3ModGFncykpXG4gICAgICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICAgICAgY29uc3QgcG9wdWxhdGVkID0gcmVjb3JkPy5wb3B1bGF0ZWQ/Lltwcm9wZXJ0eS5wYXRoXSA/PyBbXTtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHBvcHVsYXRlZFxuICAgICAgICAgICAgLm1hcCgocikgPT4gKHsgaWQ6IHIucGFyYW1zPy5pZCwgbmFtZTogci5wYXJhbXM/Lm5hbWUgfSkpXG4gICAgICAgICAgICAuZmlsdGVyKCh0KSA9PiB0LmlkICYmIHQubmFtZSk7XG4gICAgICAgIHNldFNlbGVjdGVkKGN1cnJlbnQpO1xuICAgIH0sIFtyZWNvcmQ/LmlkXSk7XG4gICAgY29uc3QgZW1pdCA9ICh0YWdzKSA9PiB7XG4gICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIHRhZ3MubWFwKHQgPT4gdC5pZCkpO1xuICAgIH07XG4gICAgY29uc3QgYWRkVGFnID0gKHRhZykgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWQuc29tZShzID0+IHMuaWQgPT09IHRhZy5pZCkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IG5leHQgPSBbLi4uc2VsZWN0ZWQsIHRhZ107XG4gICAgICAgIHNldFNlbGVjdGVkKG5leHQpO1xuICAgICAgICBlbWl0KG5leHQpO1xuICAgICAgICBzZXRRdWVyeSgnJyk7XG4gICAgICAgIHNldFNob3dEcm9wZG93bihmYWxzZSk7XG4gICAgfTtcbiAgICBjb25zdCByZW1vdmVUYWcgPSAoaWQpID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHNlbGVjdGVkLmZpbHRlcih0ID0+IHQuaWQgIT09IGlkKTtcbiAgICAgICAgc2V0U2VsZWN0ZWQobmV4dCk7XG4gICAgICAgIGVtaXQobmV4dCk7XG4gICAgfTtcbiAgICBjb25zdCBjcmVhdGVUYWcgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IGFsbFRhZ3MuZmluZCh0ID0+IHQubmFtZSA9PT0gbmFtZSk7XG4gICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgYWRkVGFnKGV4aXN0aW5nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXBpLnJlc291cmNlQWN0aW9uKHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZUlkOiAnVGFnJyxcbiAgICAgICAgICAgICAgICBhY3Rpb25OYW1lOiAnbmV3JyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7IG5hbWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgY3JlYXRlZCA9IHtcbiAgICAgICAgICAgICAgICBpZDogcmVzLmRhdGE/LnJlY29yZD8ucGFyYW1zPy5pZCxcbiAgICAgICAgICAgICAgICBuYW1lOiByZXMuZGF0YT8ucmVjb3JkPy5wYXJhbXM/Lm5hbWUgPz8gbmFtZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXRBbGxUYWdzKHByZXYgPT4gWy4uLnByZXYsIGNyZWF0ZWRdLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpKTtcbiAgICAgICAgICAgIGFkZFRhZyhjcmVhdGVkKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICBhbGVydChgQ291bGQgbm90IGNyZWF0ZSB0YWcgXCIke25hbWV9XCIuIFBsZWFzZSB0cnkgYWdhaW4uYCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGZpbHRlcmVkID0gYWxsVGFncy5maWx0ZXIodCA9PiB0Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50b0xvd2VyQ2FzZSgpKSAmJlxuICAgICAgICAhc2VsZWN0ZWQuc29tZShzID0+IHMuaWQgPT09IHQuaWQpKTtcbiAgICBjb25zdCBjaGlwID0ge1xuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNHB4JyxcbiAgICAgICAgcGFkZGluZzogJzNweCAxMHB4JywgYmFja2dyb3VuZENvbG9yOiAnIzNkNWFmMScsIGNvbG9yOiAnI2ZmZicsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA1MDAsXG4gICAgfTtcbiAgICBjb25zdCByZW1vdmVCdG4gPSB7XG4gICAgICAgIGJhY2tncm91bmQ6ICdub25lJywgYm9yZGVyOiAnbm9uZScsIGNvbG9yOiAnI2ZmZicsXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLCBsaW5lSGVpZ2h0OiAxLCBwYWRkaW5nOiAnMCAwIDAgMnB4JywgZm9udFNpemU6ICcxNHB4JyxcbiAgICB9O1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9IH0sXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6ICc2cHgnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBtaW5IZWlnaHQ6ICcyOHB4JyB9IH0sIHNlbGVjdGVkLm1hcCh0YWcgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IGtleTogdGFnLmlkLCBzdHlsZTogY2hpcCB9LFxuICAgICAgICAgICAgdGFnLm5hbWUsXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIHN0eWxlOiByZW1vdmVCdG4sIG9uQ2xpY2s6ICgpID0+IHJlbW92ZVRhZyh0YWcuaWQpIH0sIFwiXFx1MDBEN1wiKSkpKSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc2cHgnIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyByZWY6IGlucHV0UmVmLCB0eXBlOiBcInRleHRcIiwgdmFsdWU6IHF1ZXJ5LCBvbkNoYW5nZTogZSA9PiB7IHNldFF1ZXJ5KGUudGFyZ2V0LnZhbHVlKTsgc2V0U2hvd0Ryb3Bkb3duKHRydWUpOyB9LCBvbkZvY3VzOiAoKSA9PiBzZXRTaG93RHJvcGRvd24odHJ1ZSksIG9uQmx1cjogKCkgPT4gc2V0VGltZW91dCgoKSA9PiBzZXRTaG93RHJvcGRvd24oZmFsc2UpLCAyMDApLCBvbktleURvd246IGUgPT4geyBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUYWcoKTtcbiAgICAgICAgICAgICAgICB9IH0sIHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBvciBjcmVhdGUgYSB0YWdcXHUyMDI2XCIsIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGZsZXg6IDEsIHBhZGRpbmc6ICc3cHggMTFweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjNGE0YTZhJyxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNXB4JywgZm9udFNpemU6ICcxM3B4JywgYmFja2dyb3VuZENvbG9yOiAnIzFhMWEyZScsIGNvbG9yOiAnI2UwZTBlMCcsXG4gICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgIHF1ZXJ5LnRyaW0oKSAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBjcmVhdGVUYWcsIHN0eWxlOiB7IHBhZGRpbmc6ICc3cHggMTRweCcsIGJhY2tncm91bmRDb2xvcjogJyMyMmM1NWUnLCBjb2xvcjogJyNmZmYnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDUwMCB9IH0sIFwiKyBBZGRcIikpKSxcbiAgICAgICAgc2hvd0Ryb3Bkb3duICYmIGZpbHRlcmVkLmxlbmd0aCA+IDAgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwidWxcIiwgeyBzdHlsZToge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICcxMDAlJywgbGVmdDogMCwgcmlnaHQ6IDAsIHpJbmRleDogOTk5OSxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc1cHgnLFxuICAgICAgICAgICAgICAgIGxpc3RTdHlsZTogJ25vbmUnLCBtYXJnaW46ICcycHggMCcsIHBhZGRpbmc6IDAsIG1heEhlaWdodDogJzIwMHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCA0cHggMTJweCByZ2JhKDAsMCwwLDAuMTUpJyxcbiAgICAgICAgICAgIH0gfSwgZmlsdGVyZWQubWFwKHRhZyA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7IGtleTogdGFnLmlkLCBvbk1vdXNlRG93bjogKCkgPT4gYWRkVGFnKHRhZyksIHN0eWxlOiB7IHBhZGRpbmc6ICc4cHggMTJweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBjb2xvcjogJyMzMzMnIH0gfSwgdGFnLm5hbWUpKSkpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjODg4JywgbWFyZ2luOiAnNnB4IDAgMCcgfSB9LCBcIlR5cGUgdG8gc2VhcmNoIGV4aXN0aW5nIHRhZ3MgXFx1MDBCNyBwcmVzcyBFbnRlciBvciBjbGljayBcXFwiKyBBZGRcXFwiIHRvIGNyZWF0ZSBuZXdcIikpKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBUYWdQaWNrZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10YWctcGlja2VyLmpzLm1hcCIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IE1hcmtkb3duRWRpdG9yIGZyb20gJy4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvbWFya2Rvd24tZWRpdG9yJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5NYXJrZG93bkVkaXRvciA9IE1hcmtkb3duRWRpdG9yXG5pbXBvcnQgVGFnUGlja2VyIGZyb20gJy4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvdGFnLXBpY2tlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuVGFnUGlja2VyID0gVGFnUGlja2VyIl0sIm5hbWVzIjpbInJlc3VsdCIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJyZWFjdF8xIiwiX19pbXBvcnRTdGFyIiwicmVxdWlyZSQkMCIsIk1hcmtkb3duRWRpdG9yIiwidGhpcyIsInBhdGgiLCJpbml0aWFsVmFsdWUiLCJyZWNvcmQiLCJwYXJhbXMiLCJzZXRWYWx1ZSIsInVzZVN0YXRlIiwidXBsb2FkaW5nIiwic2V0VXBsb2FkaW5nIiwidGV4dGFyZWFSZWYiLCJ1c2VSZWYiLCJmaWxlSW5wdXRSZWYiLCJ1c2VFZmZlY3QiLCJmcm9tUmVjb3JkIiwiaWQiLCJoYW5kbGVDaGFuZ2UiLCJlIiwidGFyZ2V0Iiwib25DaGFuZ2UiLCJpbnNlcnRBdEN1cnNvciIsInRleHQiLCJjdXJyZW50IiwidGEiLCJzdGFydCIsInNlbGVjdGlvblN0YXJ0IiwibGVuZ3RoIiwiZW5kIiwic2VsZWN0aW9uRW5kIiwibmV4dCIsInNsaWNlIiwic2V0VGltZW91dCIsImhhbmRsZVVwbG9hZCIsImZpbGUiLCJmaWxlcyIsImZkIiwiRm9ybURhdGEiLCJhcHBlbmQiLCJyZXMiLCJmZXRjaCIsIm1ldGhvZCIsImJvZHkiLCJjcmVkZW50aWFscyIsIm9rIiwiRXJyb3IiLCJzdGF0dXMiLCJ1cmwiLCJqc29uIiwiYWx0IiwibmFtZSIsInJlcGxhY2UiLCJlcnIiLCJhbGVydCIsIm1lc3NhZ2UiLCJ3aWR0aCIsImZvbnRGYW1pbHkiLCJmb250U2l6ZSIsImxpbmVIZWlnaHQiLCJwYWRkaW5nIiwiYm9yZGVyIiwiYm9yZGVyUmFkaXVzIiwicmVzaXplIiwiYmFja2dyb3VuZENvbG9yIiwiY29sb3IiLCJtaW5IZWlnaHQiLCJib3hTaXppbmciLCJidG4iLCJjdXJzb3IiLCJmb250V2VpZ2h0IiwiZGVmYXVsdCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImRpc3BsYXkiLCJmbGV4RGlyZWN0aW9uIiwiZ2FwIiwicmVmIiwiYWxpZ25JdGVtcyIsInR5cGUiLCJkaXNhYmxlZCIsIm9uQ2xpY2siLCJjbGljayIsIl9fc2V0TW9kdWxlRGVmYXVsdCIsIm1vZCIsInRhZ1BpY2tlciIsImFkbWluanNfMSIsInJlcXVpcmUkJDEiLCJhcGkiLCJBcGlDbGllbnQiLCJUYWdQaWNrZXIiLCJwcm9wZXJ0eSIsImFsbFRhZ3MiLCJzZXRBbGxUYWdzIiwic2VsZWN0ZWQiLCJzZXRTZWxlY3RlZCIsInNldFF1ZXJ5Iiwic2V0U2hvd0Ryb3Bkb3duIiwidGhlbiIsInIiLCJ0YWdzIiwiY2F0Y2giLCJwb3B1bGF0ZWQiLCJtYXAiLCJmaWx0ZXIiLCJ0IiwiYWRkVGFnIiwidGFnIiwiZW1pdCIsInJlbW92ZVRhZyIsImNyZWF0ZVRhZyIsInF1ZXJ5IiwidHJpbSIsInRvTG93ZXJDYXNlIiwiZXhpc3RpbmciLCJmaW5kIiwicmVzb3VyY2VBY3Rpb24iLCJyZXNvdXJjZUlkIiwiYWN0aW9uTmFtZSIsImRhdGEiLCJjcmVhdGVkIiwicHJldiIsInNvcnQiLCJhIiwiYiIsImxvY2FsZUNvbXBhcmUiLCJmaWx0ZXJlZCIsImluY2x1ZGVzIiwic29tZSIsInMiLCJjaGlwIiwicmVtb3ZlQnRuIiwiZmxleFdyYXAiLCJtYXJnaW5Cb3R0b20iLCJrZXkiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBS0EsSUFBQSxPQUFBQSxNQUFBO0NBRUEsRUFBQSxDQUFBO0NBQ0MsQ0FBQSxFQUFBO0NBQ0Qs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
