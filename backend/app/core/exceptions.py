class ApplicationError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


class NotFoundError(ApplicationError):
    def __init__(self, detail: str):
        super().__init__(404, detail)


class ConflictError(ApplicationError):
    def __init__(self, detail: str):
        super().__init__(409, detail)
