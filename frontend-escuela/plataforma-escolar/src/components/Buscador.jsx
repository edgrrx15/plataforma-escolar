"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  useCallback,
} from "react";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

function GooeyFilter({ filterId, blur }) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden="true">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={blur}
            result="blur"
          />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({ layoutId }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="size-[18px] text-[#6e6e73]"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </motion.svg>
  );
}

const transition = {
  type: "spring",
  stiffness: 280,
  damping: 24,
};

const iconBubbleVariants = {
  collapsed: {
    scale: 0.8,
    opacity: 0,
  },
  expanded: {
    scale: 1,
    opacity: 1,
  },
};

export function GooeyInput({
  placeholder = "Search",
  className,
  classNames,
  collapsedWidth = 290,
  expandedWidth = 400,
  expandedOffset = 56,
  gooeyBlur = 6,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  onChange,
  disabled = false,
}) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");

  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputLayoutId = `gooey-input-field-${safeId}`;

  const inputRef = useRef(null);
  const prevExpandedRef = useRef(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] =
    useState(defaultValue);

  const isControlled = valueProp !== undefined;
  const searchText = isControlled
    ? valueProp
    : uncontrolledValue;

  const setSearchText = useCallback(
    (next) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }

      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const setExpanded = useCallback(
    (next) => {
      setIsExpanded(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      setSearchText("");
    }

    prevExpandedRef.current = isExpanded;
  }, [isExpanded, setSearchText]);

  const buttonVariants = useMemo(
    () => ({
      collapsed: {
        width: collapsedWidth,
        marginLeft: 0,
      },
      expanded: {
        width: expandedWidth,
        marginLeft: expandedOffset,
      },
    }),
    [
      collapsedWidth,
      expandedWidth,
      expandedOffset,
    ]
  );

  const handleExpand = useCallback(() => {
    if (!disabled) {
      setExpanded(true);
    }
  }, [disabled, setExpanded]);

  const handleChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
      onChange?.(e);
    },
    [setSearchText, onChange]
  );

  const handleBlur = useCallback(() => {
    if (!searchText) {
      setExpanded(false);
    }
  }, [searchText, setExpanded]);

  /**
   * APPLE STYLE SURFACE
   */

  const surfaceClass = `
  bg-[#F2F8FA]  
  backdrop-blur-2xl
  border
  border-black/[0.035]
  shadow-[0_4px_24px_rgba(15,23,42,0.05)]
  hover:shadow-[0_10px_40px_rgba(15,23,42,0.08)]
  transition-all
  duration-300
`;

  return (
    <>
      <div
        className={cn(
          "w-fit",
          className,
          classNames?.root
        )}
      >
        <GooeyFilter
          filterId={filterId}
          blur={gooeyBlur}
        />

        <div
          className={cn(
            "relative flex h-14 items-center",
            classNames?.filterWrap
          )}
          style={{
            filter: `url(#${filterId})`,
          }}
        >
          <motion.div
            className={cn(
              "flex h-14 items-center",
              classNames?.buttonRow
            )}
            variants={buttonVariants}
            initial="collapsed"
            animate={
              isExpanded
                ? "expanded"
                : "collapsed"
            }
            transition={transition}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={handleExpand}
              className={cn(
                `
                relative
                flex
                h-14
                w-full
                items-center
                gap-3
                rounded-[999px]
                px-6
                outline-none
                overflow-hidden
              `,
                surfaceClass,
                classNames?.trigger
              )}
            >
              {!isExpanded && (
                <SearchIcon
                  layoutId={iconLayoutId}
                />
              )}

              <motion.input
                layoutId={inputLayoutId}
                ref={inputRef}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                value={searchText}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={
                  disabled || !isExpanded
                }
                placeholder={placeholder}
                className={cn(
                  `
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[15px]
                  font-medium
                  tracking-[-0.01em]
                  text-[#1d1d1f]
                  outline-none
                  placeholder:text-[#a1a1a6]
                `,
                  isExpanded
                    ? "pl-1"
                    : `
                      pointer-events-none
                      text-center
                      font-semibold
                    `,
                  classNames?.input
                )}
              />
            </button>
          </motion.div>

          <motion.div
            className={cn(
              `
              absolute
              left-0
              top-1/2
              flex
              size-14
              -translate-y-1/2
              items-center
              justify-center
            `,
              classNames?.bubble
            )}
            variants={iconBubbleVariants}
            initial="collapsed"
            animate={
              isExpanded
                ? "expanded"
                : "collapsed"
            }
            transition={transition}
          >
            <div
              className={cn(
                `
                flex
                size-14
                items-center
                justify-center
                rounded-full
              `,
                surfaceClass,
                classNames?.bubbleSurface
              )}
            >
              <SearchIcon
                layoutId={iconLayoutId}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}