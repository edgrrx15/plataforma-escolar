"use client";
import { useState, useRef, useEffect, useId, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

function GooeyFilter({
  filterId,
  blur
}) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden="true">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({
  layoutId
}) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

const transition = {
  duration: 0.4,
  type: "spring",
  bounce: 0.25,
};

const iconBubbleVariants = {
  collapsed: { scale: 0, opacity: 0 },
  expanded: { scale: 1, opacity: 1 },
};

export function GooeyInput({
  placeholder = "Buscar...",
  className,
  classNames,
  collapsedWidth = 130,
  expandedWidth = 260,
  expandedOffset = 48,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  onChange,
  disabled = false
}) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputLayoutId = `gooey-input-field-${safeId}`;

  const inputRef = useRef(null);
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = valueProp !== undefined;
  const searchText = isControlled ? valueProp : uncontrolledValue;

  const setSearchText = useCallback((next) => {
    if (!isControlled) {
      setUncontrolledValue(next);
    }
    onValueChange?.(next);
  }, [isControlled, onValueChange]);

  const setExpanded = useCallback((next) => {
    setIsExpanded(next);
    onOpenChange?.(next);
  }, [onOpenChange]);

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      setSearchText("");
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, setSearchText]);

  const buttonVariants = useMemo(() => ({
    collapsed: { width: collapsedWidth, marginLeft: 0 },
    expanded: { width: expandedWidth, marginLeft: expandedOffset },
  }), [collapsedWidth, expandedWidth, expandedOffset]);

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = useCallback((e) => {
    setSearchText(e.target.value);
    onChange?.(e);
  }, [setSearchText, onChange]);

  const handleBlur = useCallback(() => {
    if (!searchText) setExpanded(false);
  }, [searchText, setExpanded]);

  // Premium HSL Glassmorphic borders and shadow system for desktop version
  const surfaceClass =
    "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500/20";

  return (
    <>
      {/* Premium expanding gooey input (NOW FOR ALL DEVICES) */}
      <div
        className={cn("w-fit flex items-center justify-start", className, classNames?.root)}>
        <GooeyFilter filterId={filterId} blur={gooeyBlur} />
        <div
          className={cn("relative flex h-10 items-center justify-center", classNames?.filterWrap)}
          style={{ filter: `url(#${filterId})` }}>
          <motion.div
            className={cn("flex h-10 items-center justify-center", classNames?.buttonRow)}
            variants={buttonVariants}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            transition={transition}>
            <button
              type="button"
              disabled={disabled}
              onClick={handleExpand}
              className={cn(
                "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold outline-none transition-[color,box-shadow,border-color] disabled:pointer-events-none disabled:opacity-50",
                surfaceClass,
                classNames?.trigger
              )}>
              {!isExpanded ? (
                <SearchIcon layoutId={iconLayoutId} />
              ) : null}
              <motion.input
                layoutId={inputLayoutId}
                ref={inputRef}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                value={searchText}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled || !isExpanded}
                placeholder={placeholder}
                className={cn(
                  "h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none truncate",
                  isExpanded
                    ? "placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-1"
                    : "pointer-events-none placeholder:text-indigo-600 dark:placeholder:text-indigo-400 font-bold text-center",
                  classNames?.input
                )} />
            </button>
          </motion.div>

          <motion.div
            className={cn(
              "absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center",
              classNames?.bubble
            )}
            variants={iconBubbleVariants}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            transition={transition}>
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full",
                surfaceClass,
                classNames?.bubbleSurface
              )}>
              <SearchIcon layoutId={iconLayoutId} />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}