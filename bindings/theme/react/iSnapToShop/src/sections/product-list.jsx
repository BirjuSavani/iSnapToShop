import { useFPI } from "fdk-core/utils";
import PropTypes from "prop-types";
import React,{ useEffect, useRef, useState } from "react";
// All CSS is embedded here as a string.
const componentStyles = `
/* 
============================================
Component.css for iSnapToShop
Generic, Theme-able Stylesheet
============================================
*/

/* 
--------------------------------------------
1. THEME VARIABLES 
--------------------------------------------
*/
:root {
/* Text Colors */
--isnap-color-text-primary: #000000; /* Black */
--isnap-color-text-secondary: #4b5563; /* Medium Gray */
--isnap-color-text-accent: #111111; /* Dark Gray/Black */
--isnap-color-text-on-accent: #ffffff; /* White on dark */
--isnap-color-text-on-success: #ffffff; /* Keep white for consistency */
--isnap-color-text-error: #dc2626; /* Optional: Red for error */

/* Background Colors */
--isnap-color-bg-primary: #ffffff; /* White */
--isnap-color-bg-secondary: #f5f5f5; /* Light Gray */
--isnap-color-bg-overlay: rgba(0, 0, 0, 0.4);/* Soft black overlay */

/* Accent & Button Colors */
--isnap-color-accent-primary: #000000; /* Black */
--isnap-color-accent-primary-hover: #333333; /* Dark Gray on hover */
--isnap-color-accent-secondary: #e5e7eb; /* Very light gray */
--isnap-color-accent-secondary-hover: #d1d5db; /* Hover shade */

/* Status Colors (Keep minimal red/green for clarity, or remove if strict grayscale is needed) */
--isnap-color-success: #16a34a; /* Optional: Green */
--isnap-color-success-hover: #15803d;
--isnap-color-border-error: #ef4444;

/* Border Colors */
--isnap-color-border: #d1d5db; /* Light Gray */
--isnap-color-border-focus: #4b5563; /* Subtle dark gray for focus */
--isnap-color-border-success: #22c55e; /* Optional */

 /* Sizing & Spacing */
 --isnap-border-radius-sm: 4px;
 --isnap-border-radius-md: 8px;
 --isnap-border-radius-lg: 16px;
 --isnap-spacing-unit: 8px;
 --isnap-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
 --isnap-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
 --isnap-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

 /* Typography */
 --isnap-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
 
 /* Drawer Overlay Styles */
 --isnap-drawer-overlay-color: rgba(249, 250, 251, 0.85);
 --isnap-drawer-overlay-noise-opacity: 0.04;
 --isnap-noise-bg: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* 
--------------------------------------------
2. BASE & LAYOUT
--------------------------------------------
*/
.isnap-container {
 font-family: var(--isnap-font-family);
 background-color: var(--isnap-color-bg-secondary);
 color: var(--isnap-color-text-primary);
 padding: calc(var(--isnap-spacing-unit) * 4) calc(var(--isnap-spacing-unit) * 2);
 margin: 0 auto;
}

.isnap-title {
 font-size: clamp(1.75rem, 5vw, 2.5rem);
 font-weight: 800;
 text-align: center;
 color: var(--isnap-color-text-primary);
 margin-bottom: calc(var(--isnap-spacing-unit) * 4);
}

.isnap-upload-section {
 text-align: center;
 margin-bottom: calc(var(--isnap-spacing-unit) * 4);
}

.isnap-upload-caption {
 margin-top: var(--isnap-spacing-unit);
 color: var(--isnap-color-text-secondary);
 font-size: 0.9rem;
 max-width: 578px;
 margin-left: auto;
 margin-right: auto;
}
.isnap-upload-caption strong {
 color: var(--isnap-color-text-primary);
}


/* 
--------------------------------------------
3. BUTTONS & INPUTS
--------------------------------------------
*/
.isnap-btn {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 gap: var(--isnap-spacing-unit);
 padding: calc(var(--isnap-spacing-unit) * 1.25) calc(var(--isnap-spacing-unit) * 3);
 font-family: inherit;
 font-size: 1rem;
 font-weight: 600;
 border-radius: var(--isnap-border-radius-md);
 border: 1px solid transparent;
 cursor: pointer;
 transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
 user-select: none;
}

.isnap-btn:active {
 transform: translateY(1px);
}

.isnap-btn:disabled {
 cursor: not-allowed;
 opacity: 0.6;
}

.isnap-btn-primary {
 background-color: var(--isnap-color-accent-primary);
 color: var(--isnap-color-text-on-accent);
}
.isnap-btn-primary:not(:disabled):hover {
 background-color: var(--isnap-color-accent-primary-hover);
}

.isnap-btn-secondary {
 background-color: var(--isnap-color-accent-secondary);
 color: var(--isnap-color-text-primary);
 border-color: var(--isnap-color-border);
}
.isnap-btn-secondary:not(:disabled):hover {
 background-color: var(--isnap-color-accent-secondary-hover);
}

.isnap-btn-success {
 background-color: var(--isnap-color-success);
 color: var(--isnap-color-text-on-success);
}
.isnap-btn-success:not(:disabled):hover {
 background-color: var(--isnap-color-success-hover);
}

.isnap-btn--full-width {
 width: 100%;
}
.isnap-btn--small {
 padding: calc(var(--isnap-spacing-unit) * 0.75) calc(var(--isnap-spacing-unit) * 1.5);
 font-size: 0.8rem;
}

.isnap-upload-btn {
 padding: calc(var(--isnap-spacing-unit) * 1.5) calc(var(--isnap-spacing-unit) * 4);
 font-size: 1.1rem;
}

.isnap-input {
 width: 100%;
 padding: calc(var(--isnap-spacing-unit) * 1.25) calc(var(--isnap-spacing-unit) * 1.5);
 font-size: 1rem;
 border: 1px solid var(--isnap-color-border);
 border-radius: var(--isnap-border-radius-md);
 background-color: var(--isnap-color-bg-primary);
 color: var(--isnap-color-text-primary);
 box-sizing: border-box;
 transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.isnap-input:focus {
 outline: none;
 border-color: var(--isnap-color-border-focus);
 box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

/* 
--------------------------------------------
4. MODALS & POPUPS
--------------------------------------------
*/
.isnap-modal-overlay,
.isnap-popup-overlay {
 position: fixed;
 inset: 0;
 z-index: 50;
  border: none;
  background: none;
  padding: 0;
  font-family: inherit; 
  text-align: inherit; 
  cursor: default;    
 background-color: var(--isnap-color-bg-overlay);
 display: flex;
 align-items: center;
 justify-content: center;
 padding: var(--isnap-spacing-unit);
 animation: isnap-fade-in 0.3s ease;
}

.isnap-modal-content,
.isnap-popup-content {
 background-color: var(--isnap-color-bg-primary);
 border-radius: var(--isnap-border-radius-lg);
 box-shadow: var(--isnap-shadow-xl);
 width: 100%;
 max-width: 500px;
 display: flex;
 flex-direction: column;
 max-height: 90vh;
 animation: isnap-slide-up 0.4s ease;
}

.isnap-popup-content {
 max-width: 900px;
}

.isnap-modal-header,
.isnap-popup-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: calc(var(--isnap-spacing-unit) * 2) calc(var(--isnap-spacing-unit) * 3);
 border-bottom: 1px solid var(--isnap-color-border);
 flex-shrink: 0;
}

.isnap-modal-title,
.isnap-popup-title {
 font-size: 1.25rem;
 font-weight: 700;
 margin: 0;
}

.isnap-modal-close-btn,
.isnap-popup-close-btn {
 background: none;
 border: none;
 font-size: 1.75rem;
 font-weight: 300;
 line-height: 1;
 color: var(--isnap-color-text-secondary);
 cursor: pointer;
 padding: 0 var(--isnap-spacing-unit);
 transition: color 0.2s ease;
 cursor: pointer;
}
.isnap-modal-close-btn:hover,
.isnap-popup-close-btn:hover {
 color: var(--isnap-color-text-primary);
}

.isnap-modal-body,
.isnap-popup-body {
 padding: calc(var(--isnap-spacing-unit) * 3);
 overflow-y: auto;
}
.isnap-modal-body--centered {
 text-align: center;
}

.isnap-label {
 display: block;
 font-weight: 600;
 font-size: 0.9rem;
 margin-bottom: var(--isnap-spacing-unit);
}

.isnap-divider {
 text-align: center;
 margin: calc(var(--isnap-spacing-unit) * 3) 0;
 color: var(--isnap-color-text-secondary);
 position: relative;
}
.isnap-divider::before {
 content: '';
 position: absolute;
 top: 50%;
 left: 0;
 right: 0;
 height: 1px;
 background-color: var(--isnap-color-border);
}
.isnap-divider span {
 background-color: var(--isnap-color-bg-primary);
 padding: 0 var(--isnap-spacing-unit);
 position: relative;
 z-index: 1;
}

.isnap-modal-actions {
 display: flex;
 flex-direction: column;
 gap: var(--isnap-spacing-unit);
 margin-top: calc(var(--isnap-spacing-unit) * 2);
}

.isnap-modal-choices {
 display: flex;
 gap: var(--isnap-spacing-unit);
 margin-bottom: calc(var(--isnap-spacing-unit) * 2);
}
.isnap-choice-btn {
 flex: 1;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 gap: var(--isnap-spacing-unit);
 padding: calc(var(--isnap-spacing-unit) * 2);
 border: 1px solid var(--isnap-color-border);
 border-radius: var(--isnap-border-radius-md);
 background-color: var(--isnap-color-bg-primary);
 cursor: pointer;
 transition: background-color 0.2s ease, border-color 0.2s ease;
 text-align: center;
}
.isnap-choice-btn:hover {
 background-color: var(--isnap-color-bg-secondary);
 border-color: var(--isnap-color-accent-primary);
}
.isnap-choice-btn svg {
 width: 28px;
 height: 28px;
 color: var(--isnap-color-accent-primary);
}
.isnap-choice-btn span {
 font-weight: 600;
 font-size: 0.9rem;
 color: var(--isnap-color-text-primary);
}


.isnap-preview-actions {
 display: flex;
 justify-content: center;
 gap: var(--isnap-spacing-unit);
 margin-top: calc(var(--isnap-spacing-unit) * 2);
}
.isnap-image-preview {
 max-width: 100%;
 max-height: 40vh;
 border-radius: var(--isnap-border-radius-md);
 object-fit: contain;
}

/* 
--------------------------------------------
5. PRODUCT GRID & CARDS
--------------------------------------------
*/
.isnap-grid {
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
 gap: calc(var(--isnap-spacing-unit) * 2);
}

.isnap-card,
.isnap-mobile-card {
 background-color: var(--isnap-color-bg-primary);
 border-radius: var(--isnap-border-radius-md);
 box-shadow: var(--isnap-shadow-md);
 transition: transform 0.3s ease, box-shadow 0.3s ease;
 overflow: hidden;
 position: relative;
}
.isnap-card:hover {
 transform: translateY(-4px);
 box-shadow: var(--isnap-shadow-lg);
}

.isnap-card__inner, .isnap-mobile-card__inner {
 pointer-events: auto;
}
.isnap-card--drawer-open .isnap-card__inner,
.isnap-mobile-card--drawer-open .isnap-mobile-card__inner {
 pointer-events: none;
}

.isnap-card__image {
 width: 100%;
 height: 200px;
 object-fit: cover;
 background-color: var(--isnap-color-bg-secondary);
}

.isnap-card__content {
 padding: calc(var(--isnap-spacing-unit) * 1.5);
}

.isnap-card__title {
 font-size: 1rem;
 font-weight: 600;
 margin: 0 0 calc(var(--isnap-spacing-unit) * 0.5) 0;
 display: -webkit-box;
 -webkit-line-clamp: 2;
 -webkit-box-orient: vertical;
 overflow: hidden;
}

.isnap-card__category {
 font-size: 0.8rem;
 color: var(--isnap-color-text-secondary);
 margin: 0 0 var(--isnap-spacing-unit) 0;
 text-transform: capitalize;
}

.isnap-card__price {
 font-size: 1.1rem;
 font-weight: 700;
 color: var(--isnap-color-text-accent);
}
.isnap-card__price--original {
 font-size: 0.9rem;
 font-weight: 400;
 color: var(--isnap-color-text-secondary);
 text-decoration: line-through;
 margin-left: var(--isnap-spacing-unit);
}

.isnap-card__actions {
 display: flex;
 gap: var(--isnap-spacing-unit);
 margin-top: calc(var(--isnap-spacing-unit) * 1.5);
}
.isnap-card__actions .isnap-btn svg {
 width: 14px;
 height: 14px;
}

/* Mobile Card Layout */
.isnap-mobile-products-container {
 display: flex;
 flex-direction: column;
 gap: calc(var(--isnap-spacing-unit) * 2);
}
.isnap-mobile-card__inner {
 display: flex;
 gap: var(--isnap-spacing-unit);
 padding: var(--isnap-spacing-unit);
}
.isnap-mobile-card__image {
 width: 100px;
 height: 100px;
 object-fit: cover;
 border-radius: var(--isnap-border-radius-sm);
 flex-shrink: 0;
}
.isnap-mobile-card__content {
 flex-grow: 1;
 display: flex;
 flex-direction: column;
}
.isnap-mobile-card__title {
 font-size: 0.9rem;
 font-weight: 600;
 margin: 0;
}

/* 
/*
--------------------------------------------
6. CARD DRAWER (ADD TO CART) - CORRECTED
--------------------------------------------
.isnap-card-drawer {
    position: fixed; /* Use 'fixed' to ensure it covers the entire viewport */
    inset: 0;
    z-index: 10;
    
    background-color: var(--isnap-drawer-overlay-color);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    
    /* Control visibility with opacity and pointer-events */
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease; /* Transition for the fade effect */
}

.isnap-card-drawer--active {
    opacity: 1;
    pointer-events: auto; /* Allow clicks on the overlay (to close it, for example) */
}

.isnap-card-drawer::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image: var(--isnap-noise-bg);
    opacity: var(--isnap-drawer-overlay-noise-opacity);
    pointer-events: none;
}

.isnap-card-drawer__content {
    /* --- Positioning and Sizing --- */
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 100%;
    max-width: 420px; /* Set a max-width for the drawer panel */
    background-color: var(--isnap-color-bg-primary, white); /* Give it a solid background */
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1); /* Add a shadow for depth */
    transform: translateX(100%) translateZ(0); /* Start off-screen */
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
    
    display: flex;
    flex-direction: column; /* Use flexbox for robust header/content/footer layout */
    padding: calc(var(--isnap-spacing-unit) * 2);
    z-index: 1;
    overflow-y: auto; /* If content overflows, this will scroll */
    opacity:0.95
}

.isnap-card-drawer--active .isnap-card-drawer__content {
    transform: translateX(0%) translateZ(0); /* Slide to its final position */
}

.isnap-card-drawer__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--isnap-color-border);
    padding-bottom: var(--isnap-spacing-unit);
    margin-bottom: calc(var(--isnap-spacing-unit) * 2);
    flex-shrink: 0; /* Prevents header from shrinking if content is large */
}

.isnap-card-drawer__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
}
.isnap-card-drawer__close-btn {
    background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--isnap-color-text-secondary);
}

.isnap-card-drawer__section {
    border: 0;
    padding: 0;
    margin-bottom: calc(var(--isnap-spacing-unit) * 2);
}

.isnap-size-selector {
    display: flex;
    flex-wrap: wrap;
    gap: var(--isnap-spacing-unit);
}

.isnap-size-btn {
    padding: var(--isnap-spacing-unit);
    min-width: 40px;
    text-align: center;
    border: 1px solid var(--isnap-color-border);
    background-color: var(--isnap-color-bg-primary);
    border-radius: var(--isnap-border-radius-sm);
    cursor: pointer;
}

.isnap-size-btn--selected {
    border-color: var(--isnap-color-accent-primary);
    background-color: var(--isnap-color-accent-primary);
    color: var(--isnap-color-text-on-accent);
}

/* 
--------------------------------------------
7. LOADING & UTILITIES
--------------------------------------------
*/
.isnap-spinner {
 display: inline-block;
 width: 18px;
 height: 18px;
 border: 2px solid currentColor;
 border-bottom-color: transparent;
 border-radius: 50%;
 animation: isnap-spin 1s linear infinite;
}

.isnap-ai-processing-overlay {
 position: absolute;
 inset: 0;
 background-color: var(--isnap-color-bg-overlay);
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 color: var(--isnap-color-text-on-accent);
 border-radius: var(--isnap-border-radius-md);
 text-align: center;
}
.isnap-ai-icon svg {
 animation: isnap-pulse 2s infinite ease-in-out;
}
.isnap-ai-processing-text {
 font-weight: 600;
 margin-top: var(--isnap-spacing-unit);
}
.isnap-ai-subtext {
 font-size: 0.9rem;
 opacity: 0.9;
}

.isnap-popup-image-section {
 padding: var(--isnap-spacing-unit);
 background-color: var(--isnap-color-bg-secondary);
 border-radius: var(--isnap-border-radius-md);
 margin-bottom: calc(var(--isnap-spacing-unit) * 2);
}
.isnap-popup-section-title {
 font-size: 1rem;
 font-weight: 600;
 margin: 0 0 var(--isnap-spacing-unit) 0;
 text-align: center;
}
.isnap-popup-selected-image-wrapper {
 position: relative;
 max-width: 300px;
 margin: 0 auto;
}
.isnap-popup-selected-image {
 width: 100%;
 max-height: 250px;
 object-fit: contain;
 border-radius: var(--isnap-border-radius-md);
}
.isnap-loading-full,
.isnap-no-results-text {
 text-align: center;
 padding: calc(var(--isnap-spacing-unit) * 5) 0;
 color: var(--isnap-color-text-secondary);
}
.isnap-loading-full .isnap-spinner {
 width: 32px;
 height: 32px;
 margin-bottom: var(--isnap-spacing-unit);
}

/* 
--------------------------------------------
8. NOTIFICATION / TOAST STYLES
--------------------------------------------
*/
.isnap-notification-container {
 position: fixed;
 top: calc(var(--isnap-spacing-unit) * 2);
 right: calc(var(--isnap-spacing-unit) * 2);
 z-index: 100;
 pointer-events: none;
}
.isnap-notification {
 display: flex;
 align-items: center;
 gap: var(--isnap-spacing-unit);
 padding: calc(var(--isnap-spacing-unit) * 1.5) calc(var(--isnap-spacing-unit) * 2);
 background-color: var(--isnap-color-bg-primary);
 border-radius: var(--isnap-border-radius-md);
 box-shadow: var(--isnap-shadow-lg);
 border-left: 4px solid var(--isnap-color-border);
 min-width: 280px;
 max-width: 350px;
 animation: isnap-toast-in 0.4s cubic-bezier(0.21, 1.02, 0.73, 1);
 pointer-events: auto;
}
.isnap-notification--success {
 border-left-color: var(--isnap-color-border-success);
}
.isnap-notification--error {
 border-left-color: var(--isnap-color-border-error);
}
.isnap-notification__icon {
 flex-shrink: 0;
}
.isnap-notification--success .isnap-notification__icon {
 color: var(--isnap-color-border-success);
}
.isnap-notification--error .isnap-notification__icon {
 color: var(--isnap-color-border-error);
}
.isnap-notification__message {
 flex-grow: 1;
 font-size: 0.9rem;
 font-weight: 500;
 color: var(--isnap-color-text-primary);
}
.isnap-notification__close {
 background: none;
 border: none;
 cursor: pointer;
 color: var(--isnap-color-text-secondary);
 font-size: 1.25rem;
 padding: 0;
 line-height: 1;
}

/* 
--------------------------------------------
9. ANIMATIONS
--------------------------------------------
*/
@keyframes isnap-spin {
 to { transform: rotate(360deg); }
}

@keyframes isnap-fade-in {
 from { opacity: 0; }
 to { opacity: 1; }
}

@keyframes isnap-slide-up {
 from { opacity: 0; transform: translateY(20px); }
 to { opacity: 1; transform: translateY(0); }
}

@keyframes isnap-pulse {
 0%, 100% { transform: scale(1); opacity: 1; }
 50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes isnap-toast-in {
 from { opacity: 0; transform: translateX(100%); }
 to { opacity: 1; transform: translateX(0); }
}

/* 
--------------------------------------------
10. RESPONSIVE DESIGN
--------------------------------------------
*/
@media (min-width: 640px) {
 .isnap-modal-actions {
 flex-direction: row-reverse;
 }
}

@media (max-width: 768px) {
 .isnap-popup-content {
 max-height: 95vh;
 }
}
`;
const LOCALITY_QUERY = `
query locality($locality: LocalityEnum!, $localityValue: String!, $country: String) {
locality(locality: $locality, localityValue: $localityValue, country: $country) {
display_name, id, name, parent_ids, type, localities {
id, name, display_name, parent_ids, type
}
}
}
`;
const PRODUCT_PRICE_QUERY = `
query ProductPrice($slug: String!, $size: String!, $pincode: String!) {
productPrice(slug: $slug, size: $size, pincode: $pincode) {
article_id, discount, is_cod, is_gift, item_type, long_lat, pincode, quantity, seller_count, special_badge,
price_per_piece { currency_code, currency_symbol, effective, marked, selling },
seller { count, name, uid },
store { uid, name, count }
}
}
`;
const ADD_TO_CART_MUTATION = `
mutation AddItemsToCart($buyNow: Boolean, $areaCode: String!, $addCartRequestInput: AddCartRequestInput) {
addItemsToCart(buyNow: $buyNow, areaCode: $areaCode, addCartRequestInput: $addCartRequestInput) {
message, partial, success, cart {
id, is_valid, items {
article { identifier, size, seller { name, uid }, price { base { currency_code, currency_symbol, effective, marked } } },
product { name, slug, brand { name } }
}
}
}
}
`;
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={24}
    height={24}
  >
    <path d="M4 7h2.586A2 2 0 0 0 8.414 6l.172-.172A2 2 0 0 1 10 5h4a2 2 0 0 1 1.414.586l.172.172A2 2 0 0 0 17.414 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);
const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
  </svg>
);
const GalleryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);
const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);
const Notification = ({ message, type, onDismiss }) => {
  const Icon = type === "success" ? SuccessIcon : ErrorIcon;
  return (
    <div className="isnap-notification-container">
      <div className={`isnap-notification isnap-notification--${type}`}>
        <div className="isnap-notification__icon">
          <Icon />
        </div>
        <p className="isnap-notification__message">{message}</p>
        <button className="isnap-notification__close" onClick={onDismiss}>
          ×
        </button>
      </div>
    </div>
  );
};
const AIProcessingOverlay = () => (
  <div className="isnap-ai-processing-overlay">
    <div className="isnap-ai-icon">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
        <path d="M12 12v9"></path>
        <path d="m8 17 4 4 4-4"></path>
      </svg>
    </div>
    <div className="isnap-ai-processing-text">AI Processing...</div>
    <div className="isnap-ai-subtext">Analyzing image</div>
  </div>
);

const Spinner = () => <span className="isnap-spinner"></span>;

const CardDrawer = ({ product, isActive, onClose, showNotification, fpi }) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [pincode, setPincode] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const checkServiceability = async () => {
    if (!selectedSize) {
      showNotification("Please select a size", "error");
      return;
    }
    if (!pincode || pincode.length !== 6) {
      showNotification("Please enter a valid 6-digit pincode", "error");
      return;
    }

    try {
      setIsAddingToCart(true);
      const localityResult = await fpi.executeGQL(LOCALITY_QUERY, {
        locality: "pincode",
        localityValue: pincode,
        country: "IN",
      });
      const localityData = localityResult?.data?.locality || localityResult?.locality;
      if (!localityData) {
        showNotification("Invalid pincode or service unavailable", "error");
        setIsAddingToCart(false);
        return;
      }
      const priceResult = await fpi.executeGQL(PRODUCT_PRICE_QUERY, {
        slug: product.slug,
        size: selectedSize,
        pincode: pincode,
      });
      const priceData = priceResult?.data?.productPrice || priceResult?.productPrice;
      if (!priceData) {
        showNotification("Product not available for this combination", "error");
        setIsAddingToCart(false);
        return;
      }
      await addToCart(priceData);
    } catch (error) {
      console.error("Serviceability check failed:", error);
      showNotification(`Serviceability check failed: ${error.message}`, "error");
      setIsAddingToCart(false);
    }
  };

  const addToCart = async productData => {
    try {
      const addToCartResult = await fpi.executeGQL(ADD_TO_CART_MUTATION, {
        buyNow: false,
        areaCode: pincode,
        addCartRequestInput: {
          items: [
            {
              article_id: productData.article_id,
              item_id: product.uid || parseInt(product.slug.split("-").pop()),
              item_size: selectedSize,
              quantity: 1,
              seller_id: productData.seller.uid,
              store_id: productData.store.uid,
            },
          ],
        },
      });
      const cartResult = addToCartResult?.data?.addItemsToCart || addToCartResult?.addItemsToCart;
      if (cartResult?.success) {
        showNotification("Product added to cart successfully!", "success");
        onClose();
      } else {
        showNotification(
          `Failed to add product: ${cartResult?.message || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
      showNotification(`Failed to add product: ${error.message}`, "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className={`isnap-card-drawer ${isActive ? "isnap-card-drawer--active" : ""}`}>
      <div className="isnap-card-drawer__content">
        <div className="isnap-card-drawer__header">
          <h3 className="isnap-card-drawer__title">Add to Cart</h3>
          <button onClick={onClose} className="isnap-card-drawer__close-btn">
            ×
          </button>
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <fieldset className="isnap-card-drawer__section">
            <legend className="isnap-label">Select Size</legend>
            <div className="isnap-size-selector">
              {product.sizes.map(size => (
                <button
                  key={size.size}
                  className={`isnap-size-btn ${
                    selectedSize === size.size ? "isnap-size-btn--selected" : ""
                  }`}
                  onClick={() => setSelectedSize(size.size)}
                >
                  {size.size}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <div className="isnap-card-drawer__section">
          <label htmlFor="pincode-input" className="isnap-label">
            Enter Pincode
          </label>
          <input
            id="pincode-input"
            type="text"
            value={pincode}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 6) setPincode(value);
            }}
            placeholder="6-digit pincode"
            className="isnap-input"
          />
        </div>
        <button
          className="isnap-btn isnap-btn-success isnap-btn--full-width"
          onClick={checkServiceability}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            "Adding..."
          ) : (
            <>
              <CartIcon /> Confirm & Add
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Required for FDK to register the server call
export function Component(props) {
  const fpi = useFPI();

  const [productFilterList, setProductFilterList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [notification, setNotification] = useState(null);

  const notificationTimeoutRef = useRef(null);
  const promptInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const API_BASE_URL_2 = `/ext/int/api/proxy/scan`;
  const title = props.title?.value ?? "";

  const showNotification = (message, type = "info", duration = 3000) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if ((showUploadModal || showGenerateModal) && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [showUploadModal, showGenerateModal]);
  useEffect(() => {
    const shouldLockScroll =
      showPopup || showUploadModal || showGenerateModal || showImagePreviewModal;
    document.body.style.overflow = shouldLockScroll ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPopup, showUploadModal, showGenerateModal, showImagePreviewModal]);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleImageUpload = async file => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showNotification("Please select a valid image file", "error");
      return;
    }
    try {
      setSelectedImage(URL.createObjectURL(file));
      setLoading(true);
      setShowUploadModal(false);
      const formData = new FormData();
      formData.append("image", file);
      console.log("Uploading image:", file.name);
      const response = await fetch(`${API_BASE_URL_2}/search-by-image-using-store-front`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      console.log("Response", response);
      const data = await response.json();
      console.log(data, "data");
      setProductFilterList(data.results || []);
      setShowPopup(true);
    } catch (error) {
      console.log(error, "error");
      console.error("Error during image upload search:", error);
      setProductFilterList([]);
      showNotification("Error processing image. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateImageFromPrompt = async prompt => {
    if (!prompt.trim()) {
      showNotification("Please enter a description for the image", "error");
      return;
    }
    try {
      setIsGenerating(true);
      const response = await fetch(`${API_BASE_URL_2}/generate-prompts-to-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setShowImagePreviewModal(true);
        setShowGenerateModal(false);
      } else {
        throw new Error(data.message || "Image generation failed");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      showNotification("Failed to generate image. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptGeneratedImage = async () => {
    if (!generatedImageUrl) return;
    try {
      setLoading(true);
      setShowImagePreviewModal(false);
      await handleImageUploadEnhanced(generatedImageUrl);
    } catch (error) {
      console.error("Error processing generated image:", error);
      showNotification("Error processing image. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateImage = previousPrompt => {
    setShowImagePreviewModal(false);
    setShowGenerateModal(true);
    setPromptText(previousPrompt);
  };

  const handleImageUploadEnhanced = async imageUrl => {
    try {
      setLoading(true);
      setShowUploadModal(false);
      const imageResponse = await fetch(imageUrl, {
        method: "GET",
        headers: { Accept: "image/*" },
        mode: "cors",
      });
      if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      const imageBlob = await imageResponse.blob();
      const file = new File([imageBlob], "generated-image.png", {
        type: imageBlob.type || "image/png",
        lastModified: Date.now(),
      });
      const formData = new FormData();
      formData.append("image", file);
      setSelectedImage(imageUrl);
      const uploadResponse = await fetch(`${API_BASE_URL_2}/search-by-image-using-store-front`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!uploadResponse.ok)
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      const result = await uploadResponse.json();
      setProductFilterList(result.results || []);
      setShowPopup(true);
    } catch (error) {
      console.error("Enhanced upload failed:", error);
      setProductFilterList([]);
      showNotification(`Error processing image: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = product => {
    const productSlug =
      product.slug || product.id || product.name.toLowerCase().replace(/\s+/g, "-");
    window.open(`/product/${productSlug}`, "_blank");
  };
  const handleAddToCart = productId =>
    setActiveDrawer(prev => (prev === productId ? null : productId));
  const closePopup = e => {
    if (e.target === e.currentTarget) {
      setShowPopup(false);
      setSelectedImage(null);
      setActiveDrawer(null);
    }
  };
  const closePopupFromButton = () => {
    setShowPopup(false);
    setSelectedImage(null);
    setActiveDrawer(null);
  };
  const formatPrice = price => `₹${price.toLocaleString()}`;
  const formatCategoryName = category =>
    category ? category.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "";
  const openUploadModal = () => setShowUploadModal(true);
  const handleFileInputChange = e => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };
  const triggerFileUpload = () => fileInputRef.current?.click();
  const triggerCameraUpload = () => cameraInputRef.current?.click();

  return (
    <div className="isnap-container">
      <style>{componentStyles}</style>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
        />
      )}

      <h1 className="isnap-title">{title}</h1>

      <div className="isnap-upload-section">
        <button
          onClick={openUploadModal}
          className="isnap-btn isnap-btn-primary isnap-upload-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner /> Analyzing...
            </>
          ) : (
            <>
              <CameraIcon /> Upload or Generate Image
            </>
          )}
        </button>
        <div className="isnap-upload-caption">
          <strong>iSnapToShop :</strong>
          <span> Find products by uploading an image or describing what you're looking for.</span>
        </div>
      </div>

      {showUploadModal && (
        <div className="isnap-modal-overlay">
          <div className="isnap-modal-content">
            <div className="isnap-modal-header">
              <h2 className="isnap-modal-title">Find Your Product</h2>
              <button className="isnap-modal-close-btn" onClick={() => setShowUploadModal(false)}>
                ×
              </button>
            </div>
            <div className="isnap-modal-body">
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileInputChange}
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*"
                style={{ display: "none" }}
              />

              <div className="isnap-modal-choices">
                {isMobile && (
                  <button onClick={triggerCameraUpload} className="isnap-choice-btn">
                    <CameraIcon />
                    <span>Take Photo</span>
                  </button>
                )}
                <button onClick={triggerFileUpload} className="isnap-choice-btn">
                  <GalleryIcon />
                  <span>{isMobile ? "Choose from Library" : "Upload from Computer"}</span>
                </button>
              </div>

              <div className="isnap-divider">
                <span>OR</span>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setShowGenerateModal(true);
                }}
                className="isnap-btn isnap-btn-secondary isnap-btn--full-width"
              >
                Generate Image with AI
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div className="isnap-modal-overlay">
          <div className="isnap-modal-content">
            <div className="isnap-modal-header">
              <h2 className="isnap-modal-title">Generate Product Image</h2>
              <button className="isnap-modal-close-btn" onClick={() => setShowGenerateModal(false)}>
                ×
              </button>
            </div>
            <div className="isnap-modal-body">
              <label htmlFor="prompt-input" className="isnap-label">
                Describe your product
              </label>
              <input
                id="prompt-input"
                type="text"
                ref={promptInputRef}
                className="isnap-input"
                placeholder='e.g., "Red floral print summer dress"'
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                disabled={isGenerating}
              />
              <div className="isnap-modal-actions">
                <button
                  onClick={() => {
                    setShowGenerateModal(false);
                    setShowUploadModal(true);
                  }}
                  className="isnap-btn isnap-btn-secondary isnap-btn--full-width"
                >
                  Back to Upload
                </button>
                <button
                  onClick={() => generateImageFromPrompt(promptText)}
                  className="isnap-btn isnap-btn-primary isnap-btn--full-width"
                  disabled={isGenerating || !promptText}
                >
                  {isGenerating ? (
                    <>
                      <Spinner /> Generating...
                    </>
                  ) : (
                    "Generate Image"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImagePreviewModal && generatedImageUrl && (
        <div className="isnap-modal-overlay">
          <div className="isnap-modal-content">
            <div className="isnap-modal-header">
              <h2 className="isnap-modal-title">Generated Image Preview</h2>
              <button
                className="isnap-modal-close-btn"
                onClick={() => setShowImagePreviewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="isnap-modal-body isnap-modal-body--centered">
              <img
                src={generatedImageUrl}
                alt="Generated from prompt"
                className="isnap-image-preview"
              />
              <div className="isnap-preview-actions">
                <button
                  onClick={() => handleRegenerateImage(promptText)}
                  className="isnap-btn isnap-btn-secondary"
                >
                  Regenerate
                </button>
                <button
                  onClick={handleAcceptGeneratedImage}
                  className="isnap-btn isnap-btn-success"
                >
                  Use This Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showPopup || loading) && (
        <button className="isnap-popup-overlay" onClick={e => closePopup(e)}>
          <div className="isnap-popup-content">
            <div className="isnap-popup-header">
              <h2 className="isnap-popup-title">
                {loading ? "Searching..." : `Search Results (${productFilterList.length})`}
              </h2>
              <button className="isnap-popup-close-btn" onClick={closePopupFromButton}>
                ×
              </button>
            </div>
            <div className="isnap-popup-body">
              {selectedImage && (
                <div className="isnap-popup-image-section">
                  <h3 className="isnap-popup-section-title">Your Image</h3>
                  <div className="isnap-popup-selected-image-wrapper">
                    <img
                      src={selectedImage}
                      alt="Uploaded for search"
                      className="isnap-popup-selected-image"
                    />
                    {loading && <AIProcessingOverlay />}
                  </div>
                </div>
              )}
              {loading && !selectedImage && (
                <div className="isnap-loading-full">
                  <Spinner />
                  <p>Finding perfect matches for you...</p>
                </div>
              )}
              {!loading && (
                <>
                  {productFilterList.length > 0 ? (
                    <div className={isMobile ? "isnap-mobile-products-container" : "isnap-grid"}>
                      {productFilterList.map((product, index) => {
                        const productId = product.slug || `prod-${index}`;
                        const price = product.sizes?.[0]?.price;
                        const isDrawerActive = activeDrawer === productId;
                        const cardBaseClass = isMobile ? "isnap-mobile-card" : "isnap-card";
                        let drawerOpenClass = "";
                        if (isDrawerActive) {
                          drawerOpenClass = isMobile
                            ? "isnap-mobile-card--drawer-open"
                            : "isnap-card--drawer-open";
                        }
                        return (
                          <div
                            key={productId}
                            className={`${isMobile ? "isnap-mobile-card" : "isnap-card"} ${
                              isDrawerActive
                                ? isMobile
                                  ? "isnap-mobile-card--drawer-open"
                                  : "isnap-card--drawer-open"
                                : ""
                            }`}
                          >
                            <div
                              className={
                                isMobile ? "isnap-mobile-card__inner" : "isnap-card__inner"
                              }
                            >
                              <img
                                src={
                                  product.image || // 1. Try to use the direct image URL first
                                  product.media?.find(m => m.type === 'image')?.url // 2. Fallback to the media array
                                }
                                alt={product.name}
                                className={
                                  isMobile ? "isnap-mobile-card__image" : "isnap-card__image"
                                }
                                onError={e => {
                                  e.target.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWNlY2VjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjYWFhIj5JbWFnZTwvdGV4dD48L3N2Zz4=";
                                }}
                              />
                              <div
                                className={
                                  isMobile ? "isnap-mobile-card__content" : "isnap-card__content"
                                }
                              >
                                <h3
                                  className={
                                    isMobile ? "isnap-mobile-card__title" : "isnap-card__title"
                                  }
                                >
                                  {product.name?.length > 16
                                    ? product.name.slice(0, 16) + "..."
                                    : product.name}
                                </h3>
                                <p className="isnap-card__category">
                                  {formatCategoryName(product.category)}
                                </p>
                                {price && (
                                  <div className="isnap-card__price">
                                    {formatPrice(price.effective.min)}
                                    {price.marked.min > price.effective.min && (
                                      <span className="isnap-card__price--original">
                                        {formatPrice(price.marked.min)}
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div className="isnap-card__actions">
                                  <button
                                    className="isnap-btn isnap-btn-secondary isnap-btn--small"
                                    onClick={() => handleViewDetails(product)}
                                  >
                                    Details
                                  </button>
                                  <button
                                    className="isnap-btn isnap-btn-success isnap-btn--small"
                                    onClick={() => handleAddToCart(productId)}
                                  >
                                    <CartIcon /> Add
                                  </button>
                                </div>
                              </div>
                            </div>
                            <CardDrawer
                              product={product}
                              isActive={isDrawerActive}
                              onClose={() => setActiveDrawer(null)}
                              showNotification={showNotification}
                              fpi={fpi}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="isnap-no-results-text">No matching products found.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

Component.propTypes = {
  title: PropTypes.shape({
    value: PropTypes.string,
  }),
};

Component.defaultProps = {
  title: {
    value: "",
  },
};

CardDrawer.propTypes = {
  product: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
  fpi: PropTypes.object.isRequired,
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

// FDK settings remain unchanged
Component.serverFetch = async ({ fpi }) => {
  return {};
};
export const settings = {
  label: "iSnapToShop",
  name: "product-list",
  props: [{ id: "title", label: "Page Title", type: "text", default: "" }],
  blocks: [],
};
