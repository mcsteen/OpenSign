import React, { useState, useEffect } from "react";
import dp from "../assets/images/dp.png";
import FullScreenButton from "./FullScreenButton";
import { useNavigate } from "react-router-dom";
import Parse from "parse";
import { useWindowSize } from "../hook/useWindowSize";
import {
  checkIsSubscribed,
  formatDate,
  getAppLogo,
  openInNewTab,
  saveLanguageInLocal
} from "../constant/Utils";
import { isEnableSubscription, isStaging } from "../constant/const";
import { validplan } from "../json/plansArr";
import { useTranslation } from "react-i18next";
import ModalUi from "../primitives/ModalUi";
import QuotaCard from "../primitives/QuotaCard";

const Header = ({ showSidebar, setIsMenu }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const current_notification_version = "1"; // Update this with each new feature release
  // Get the dismissed version from local storage
  const dismissedVersion = localStorage.getItem("notificationDismissedVersion");
  const username = localStorage.getItem("username") || "";
  const image = localStorage.getItem("profileImg") || dp;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(true);
  const [isTeam, setIsTeam] = useState({ plan: "", isValid: false });
  const [applogo, setAppLogo] = useState(
    localStorage.getItem("appLogo") || " "
  );
  const [emailUsed, setEmailUsed] = useState(0);
  const [isModal, setIsModal] = useState(false);
  const [emailResetDate, setEmailResetDate] = useState("");
  const [showNotification, setShowNotification] = useState(
    (!dismissedVersion || dismissedVersion !== current_notification_version) &&
      true
  );
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (width <= 768) {
      setIsMenu(false);
    }
  };
  useEffect(() => {
    checkSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function checkSubscription() {
    if (isEnableSubscription) {
      const subscribe = await checkIsSubscribed();
      if (subscribe.isValid) {
        const applogo = await getAppLogo();
        if (applogo?.logo) {
          setAppLogo(applogo?.logo);
        } else {
          setAppLogo(localStorage.getItem("appLogo") || "");
        }
      }
      setIsTeam(subscribe);
      setIsSubscribe(subscribe.isValid);
      try {
        const extUser = await Parse.Cloud.run("getUserDetails");
        const MonthlyFreeEmails = extUser?.get("MonthlyFreeEmails") || 0;
        setEmailUsed(MonthlyFreeEmails);
        if (extUser) {
          const _extUser = JSON.parse(JSON.stringify(extUser));
          if (_extUser?.LastEmailCountReset?.iso) {
            const resetDate = formatDate(_extUser?.LastEmailCountReset?.iso);
            setEmailResetDate(resetDate);
          }
          localStorage.setItem("Extand_Class", JSON.stringify([_extUser]));
        }
      } catch (err) {
        console.log("err in while fetching monthlyfreeEmails", err);
      }
    } else {
      const applogo = await getAppLogo();
      if (applogo?.logo) {
        setAppLogo(applogo?.logo);
      } else {
        setAppLogo(localStorage.getItem("appLogo") || "");
      }
    }
  }

  const closeDropdown = async () => {
    setIsOpen(false);
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
    }
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);

    navigate("/");
  };

  //handle to close profile drop down menu onclick screen
  useEffect(() => {
    const closeMenuOnOutsideClick = (e) => {
      if (isOpen && !e.target.closest("#profile-menu")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, [isOpen]);
  const handleConsoleRedirect = () => {
    if (isStaging) {
      window.open(" https://staging-console.opensignlabs.com/");
    } else {
      window.open("https://console.opensignlabs.com/");
    }
  };
  const handleNavigation = () => {
    navigate("/subscription");
  };
  const handleMailUsed = () => {
    setIsModal(!isModal);
  };
  // Handle dismissing the notification
  const dismissNotification = () => {
    // Store the current version as dismissed in local storage
    localStorage.setItem(
      "notificationDismissedVersion",
      current_notification_version
    );
    setShowNotification(false);
  };
  const handleSetupNowNavigation = () => {
    const url = isStaging
      ? "https://staging-console.opensignlabs.com/fileadapter"
      : "https://console.opensignlabs.com/fileadapter";

    openInNewTab(url);
  };
  return (
    <div>
      {isEnableSubscription && showNotification && (
        <div className="flex justify-between items-center shadow py-1 bg-[#CAE4FA] p-1">
          <div className="text-center text-[14px] ml-auto">
            {t("header-news")} —
            <span
              className="cursor-pointer font-medium underline text-blue-800"
              onClick={() => handleSetupNowNavigation()}
            >
              {" " + t("header-news-btn") + "."}
            </span>
          </div>
          <div
            className="ml-auto mr-1 cursor-pointer"
            onClick={() => dismissNotification()}
          >
            <i className="fa-light fa-xmark"></i>
          </div>
        </div>
      )}
      <div className="op-navbar bg-base-100 shadow">
        <div className="flex-none">
          <button
            className="op-btn op-btn-square op-btn-ghost focus:outline-none hover:bg-transparent op-btn-sm no-animation"
            onClick={showSidebar}
          >
            <i className="fa-light fa-bars text-xl text-base-content"></i>
          </button>
        </div>
        <div className="flex-1 ml-2">
          <div className="h-[25px] md:h-[40px] w-auto overflow-hidden">
            <img
              className="object-contain h-full w-auto"
              src={applogo}
              alt="img"
            />
          </div>
        </div>
        <div id="profile-menu" className="flex-none gap-2">
          {!isSubscribe && (
            <div>
              <button
                className="text-xs md:text-sm shadow op-btn op-btn-outline op-btn-sm md:op-btn-md op-btn-accent"
                onClick={() => handleNavigation()}
              >
                {t("upgrade-now")}
              </button>
            </div>
          )}
          {isTeam.isValid && !validplan[isTeam.plan] && (
            <div className="w-[35px] h-[35px] bg-white rounded-full ring-[1px] ring-offset-2 ring-[#002862] text-[#002862] overflow-hidden font-semibold flex items-center justify-center">
              {t("pro")}
            </div>
          )}
          {validplan[isTeam.plan] && (
            <div className="w-[35px] h-[35px] bg-white rounded-full ring-[1px] text-[13px] ring-offset-2 ring-[#002862] text-[#002862] overflow-hidden font-semibold flex items-center justify-center">
              {t("team")}
            </div>
          )}
          <div>
            <FullScreenButton />
          </div>
          {width >= 768 && (
            <div
              onClick={toggleDropdown}
              className="cursor-pointer w-[35px] h-[35px] rounded-full ring-[1px] ring-offset-2 ring-gray-400 overflow-hidden"
            >
              <img
                className="w-[35px] h-[35px] object-contain"
                src={image}
                alt="img"
              />
            </div>
          )}
          {width >= 768 && (
            <div
              onClick={toggleDropdown}
              className="cursor-pointer text-base-content text-sm"
            >
              {username && username}
            </div>
          )}
          <div className="op-dropdown op-dropdown-end" id="profile-menu">
            <div
              tabIndex={0}
              role="button"
              className="op-btn op-btn-ghost op-btn-xs w-[10px] h-[20px] hover:bg-transparent"
            >
              <i
                tabIndex={0}
                role="button"
                onClick={toggleDropdown}
                className="fa-light fa-angle-down text-base-content"
              ></i>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow op-menu op-menu-sm op-dropdown-content text-base-content bg-base-100 rounded-box w-52"
            >
              <li onClick={() => openInNewTab("https://docs.opensignlabs.com")}>
                <span>
                  <i className="fa-light fa-book"></i> {t("docs")}
                </span>
              </li>
              <li
                onClick={() => {
                  setIsOpen(false);
                  navigate("/profile");
                }}
              >
                <span>
                  <i className="fa-light fa-user"></i> {t("profile")}
                </span>
              </li>
              <li
                onClick={() => {
                  setIsOpen(false);
                  navigate("/changepassword");
                }}
              >
                <span>
                  <i className="fa-light fa-lock"></i> {t("change-password")}
                </span>
              </li>
              {isEnableSubscription && (
                <li onClick={() => handleConsoleRedirect()}>
                  <span>
                    <i className="fa-light fa-id-card"></i> Console
                  </span>
                </li>
              )}
              {isEnableSubscription && isTeam?.plan === "freeplan" && (
                <li className="cursor-pointer" onClick={handleMailUsed}>
                  <span>
                    <i className="fa-light fa-envelope"></i>
                    {emailUsed}/15 {t("sent-this-month")}
                  </span>
                </li>
              )}
              <li onClick={closeDropdown}>
                <span>
                  <i className="fa-light fa-arrow-right-from-bracket"></i>{" "}
                  {t("log-out")}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <ModalUi isOpen={isModal}>
        <QuotaCard
          isPaidInfo={true}
          handlClose={handleMailUsed}
          emailResetDate={emailResetDate}
        />
      </ModalUi>
    </div>
  );
};

export default Header;
