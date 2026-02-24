import React from 'react';

export const SearchModal = () => {
    return (
        <div className="modal fade" id="searchModal" tabIndex={-1} role="dialog" aria-labelledby="searchModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body p-5">
                        <form action="#" className="search-form">
                            <div className="form-group">
                                <div className="icon"><span className="icon-search"></span></div>
                                <input type="text" className="form-control" placeholder="Type keywords and hit enter..." />
                            </div>
                        </form>
                        <div className="search-suggestions mt-4">
                            <h6 className="text-muted mb-3">Suggested:</h6>
                            <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                <a href="how-we-work.html" className="badge badge-light p-2">IkiraroBiz</a>
                                <a href="about.html" className="badge badge-light p-2">Our Mission</a>
                                <a href="impact-stories.html" className="badge badge-light p-2">Impact Stories</a>
                                <a href="donate.html" className="badge badge-light p-2">Donate</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
