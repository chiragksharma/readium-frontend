import Router from "next/router";
import React from "react";
import useSWR from "swr";

import ListErrors from "../../components/common/ListErrors";
import TagInput from "../../components/editor/TagInput";
import ArticleAPI from "../../lib/api/article";
import storage from "../../lib/utils/storage";
import editorReducer from "../../lib/utils/editorReducer";

import dynamic from "next/dynamic";

const QuillNoSSRWrapper = dynamic(import("react-quill"), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
});

const modules = {
    toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
        ],
        ["link", "image", "video"],
        ["clean"],
    ],
    clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
    },
};

const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
];

const PublishArticleEditor = () => {
    const initialState = {
        title: "",
        description: "",
        body: "",
        tagList: [],
    };

    const [isLoading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState([]);
    const [posting, dispatch] = React.useReducer(editorReducer, initialState);
    const { data: currentUser } = useSWR("user", storage);

    const handleTitle = (e) =>
        dispatch({ type: "SET_TITLE", text: e.target.value });
    const handleDescription = (e) =>
        dispatch({ type: "SET_DESCRIPTION", text: e.target.value });
    const handleBody = (e) =>
        dispatch({ type: "SET_BODY", text: e });
    const addTag = (tag) => dispatch({ type: "ADD_TAG", tag: tag });
    const removeTag = (tag) => dispatch({ type: "REMOVE_TAG", tag: tag });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, status } = await ArticleAPI.create(
            posting,
            currentUser?.token
        );

        setLoading(false);

        if (status !== 200) {
            setErrors(data.errors);
        }

        Router.push("/");
    };

    return (
        <div className="editor-page">
            <div className="container page">
                <div className="row">
                    <div className="col-md-10 offset-md-1 col-xs-12">
                        <ListErrors errors={errors} />
                        <form>
                            <fieldset>
                                <fieldset className="form-group">
                                    <input
                                        className="form-control form-control-lg"
                                        type="text"
                                        placeholder="Article Title"
                                        value={posting.title}
                                        onChange={handleTitle}
                                    />
                                </fieldset>

                                <fieldset className="form-group">
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="What's this article about?"
                                        value={posting.description}
                                        onChange={handleDescription}
                                    />
                                </fieldset>

                                {/* <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    value={posting.body}
                    onChange={handleBody}
                  />
                </fieldset> */}
                                <QuillNoSSRWrapper
                                    modules={modules}
                                    formats={formats}
                                    theme="snow"
                                    // onChange={(content) => {
                                    //   // var htmlToRtf = require('html-to-rtf');
                                    //   console.log("CONTETN: ", content);
                                    // }}
                                    onChange={handleBody}
                                />

                                <TagInput
                                    tagList={posting.tagList}
                                    addTag={addTag}
                                    removeTag={removeTag}
                                />

                                <button
                                    className="btn btn-lg pull-xs-right btn-primary"
                                    type="button"
                                    disabled={isLoading}
                                    onClick={handleSubmit}
                                >
                                    Publish Article
                                </button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublishArticleEditor;
