import marked from "marked";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

import ArticleMeta from "../../components/article/ArticleMeta";
import CommentList from "../../components/comment/CommentList";
import ArticleAPI from "../../lib/api/article";
import { Article } from "../../lib/types/articleType";
import { SERVER_BASE_URL } from "../../lib/utils/constant";
import fetcher from "../../lib/utils/fetcher";
import { ShareButtonCircle, ShareBlockStandard  } from "react-custom-share";
import {FaTwitter} from "react-icons/fa";
import {FaFacebook} from "react-icons/fa";
import {FaEnvelope} from "react-icons/fa";
import {FaLinkedin} from "react-icons/fa";

const ArticlePage = (initialArticle) => {
    const [copied, setCopied] = React.useState(false);
    const [pageURL, setPageURL]: any = React.useState(0);
    React.useEffect(() => {
      setPageURL(window.location.href);
    })
    const shareBlockProps = {
      url: pageURL,
      button: ShareButtonCircle,
      buttons: [
        { network: "Twitter", icon: FaTwitter },
        { network: "Facebook", icon: FaFacebook },
        { network: "Email", icon: FaEnvelope },
        { network: "Linkedin", icon: FaLinkedin }
      ],
    };

    function copy() {
        const el = document.createElement("input");
        el.value = pageURL;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
    }
    
    function copy2() {
        const el = document.createElement("input");
        el.value = pageURL;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
    }
    
    const router = useRouter();
    const {
        query: { pid },
    } = router;

    const { data: fetchedArticle } = useSWR(
        `${SERVER_BASE_URL}/articles/${encodeURIComponent(String(pid))}`,
        fetcher,
        { initialData: initialArticle }
    );

    const { article }: Article = fetchedArticle || initialArticle;

    const markup = {
        __html: article.body,
    };

    return (
        <div className="article-page">
            <div className="banner">
                <div className="container">
                    <div style={{display: 'inline-flex'}}><h1>{article.title} </h1>
                    <button
                            onClick={copy}
                            style={{
                                margin: "4px",
                                backgroundColor: !copied ? "white" : "gray",
                                border: "none",
                                borderRadius: "50%",
                                height: "100%",
                            }}
                        >
                            <img
                                style={{ width: "12px", height: "12px" }}
                                src="/images/copy-logo.svg"
                            ></img>
                        </button></div>
                    <div className="App" style={{display: "flex", marginTop: "8px"}}>
                      <ShareBlockStandard  {...shareBlockProps} />
                    </div>
                    <ArticleMeta article={article} />
                </div>
            </div>
            <div className="container page">
                <div className="row article-content">
                    <div className="col-xs-12">
                        <div dangerouslySetInnerHTML={markup} />
                        <ul className="tag-list">
                            {article.tagList.map((tag) => (
                                <li
                                    key={tag}
                                    className="tag-default tag-pill tag-outline"
                                >
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <hr />
                <div className="article-actions" />
                <div className="row">
                    <div className="col-xs-12 col-md-8 offset-md-2">
                        <CommentList />
                    </div>
                </div>
            </div>
        </div>
    );
};

ArticlePage.getInitialProps = async ({ query: { pid } }) => {
    const { data } = await ArticleAPI.get(pid);
    return data;
};

export default ArticlePage;
